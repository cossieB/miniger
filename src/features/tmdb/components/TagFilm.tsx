import { createAsync, query, revalidate } from "@solidjs/router"
import { TMDBClient, type TMDBMovie, type TMDBTv } from "../api"
import { cleanTitle } from "../utils/cleanTitle";
import { state } from "~/state";
import type { TMDBFilmDialog } from "~/state/dialog";
import { invoke } from "@tauri-apps/api/core";
import { createSignal, For, Suspense, type Accessor, type Setter } from "solid-js";
import styles from "./TMDB.module.css"
import { MyLoader } from "~/components/MyLoader";
import { CheckIcon, XIcon } from "lucide-solid";
import type { UnwrapPromise } from "~/lib/utilityTypes";
import { db } from "~/kysely/database";
import { sql } from "kysely";
import { saveImg } from "~/utils/saveImg";
import { TMDB_IMG_PATH } from "~/constants";
import { getFilms } from "~/features/movies";
import { getTags } from "~/features/tags/api";
import { getActors } from "~/features/actors/api";
import { exists } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { ImgSubfolder } from "~/types";

const searchFilm = query(async (title: string, isTv = false) => {
    if (!title) return { results: [] }
    const apiKey = await invoke<string>("get_password")
    const tmdbCient = new TMDBClient(apiKey);
    if (isTv) return tmdbCient.search(title, "tv")
    return tmdbCient.search(title, "movie")
}, "tmdbFilmSearch")

export function TagFilm(props: { dialogRef: HTMLDialogElement }) {
    props.dialogRef.onclose = () => state.dialog.close()
    const dialog = () => state.dialog.active as TMDBFilmDialog

    const [searchTerm, setSearchTerm] = createSignal(cleanTitle(dialog().data.title));
    // const [isTv, setIsTv] = createSignal(false)
    const [isSaving, setIsSaving] = createSignal(false)
    const searchResult = createAsync(() => searchFilm(searchTerm()))
    return (
        <form class={styles.autotag}>
            <aside>
                <span>{dialog().data.path}</span>
                <button formMethod="dialog">
                    <XIcon />
                </button>
            </aside>
            <div class={styles.inputs}>
                <label>Search query</label>
                <input type="text" value={searchTerm()} onChange={e => setSearchTerm(e.currentTarget.value)} />
                {/* <label>TV</label> */}
                {/* <input type="checkbox" checked={isTv()} onChange={e => setIsTv(e.currentTarget.checked)} class="volt-switch" name="" id="" /> */}
            </div>
            <Suspense fallback={<MyLoader />}>
                <div class={styles.results}>
                    <For each={searchResult()?.results}>
                        {item =>
                            <SearchResult
                                item={item}
                                setIsSaving={setIsSaving}
                                isSaving={isSaving}
                            />
                        }
                    </For>
                </div>
            </Suspense>
        </form>
    )
}

type Props = {
    item: NonNullable<UnwrapPromise<ReturnType<typeof searchFilm>>>['results'][number]
    isSaving: Accessor<boolean>
    setIsSaving: Setter<boolean>
}

function SearchResult(props: Props) {
    const dialog = () => state.dialog.active as TMDBFilmDialog

    async function tag() {
        props.setIsSaving(true)
        const apiKey = await invoke<string>("get_password")
        const tmdbCient = new TMDBClient(apiKey);
        try {
            const type = 'title' in props.item ? "movie" : "tv"
            const detail = await tmdbCient.detail(props.item.id, type as any) as TMDBMovie | TMDBTv
            const credits = await tmdbCient.getCredits(props.item.id, type);
            const { title, releaseDate } = 'title' in detail ? {
                title: detail.title,
                releaseDate: detail.release_date
            } : {
                title: detail.name,
                releaseDate: detail.first_air_date
            };


            if (credits.length > 0) {
                const actors = await db.transaction().execute(async tx => {
                    const actors = await tx.insertInto("actor")
                        .values(credits.map(c => ({
                            name: c.name,
                            tmdbId: c.id,
                            gender: c.gender === 1 ? "F" : c.gender === 2 ? "M" : undefined,
                        })))
                        .onConflict(oc => oc.column("tmdbId").doUpdateSet({
                            name: sql`EXCLUDED.name`,
                            gender: sql`EXCLUDED.gender`,
                            tmdbId: sql`EXCLUDED.tmdb_id`
                        }))
                        .returningAll()
                        .execute()
                    await tx.insertInto("actorFilm").values(actors.map(a => ({
                        actorId: a.actorId,
                        filmId: dialog().data.filmId
                    })))
                        .onConflict(oc => oc.doNothing())
                        .execute()

                    if (detail) {
                        await tx.updateTable("film").set({
                            title: title,
                            tmdbId: detail.id,
                            releaseDate: releaseDate,
                        })
                            .where("film.filmId", "=", dialog().data.filmId)
                            .where("tmdbId", "is", null)
                            .execute()

                        if (detail.poster_path && !await exists(await join(await appDataDir(), "images", ImgSubfolder.Posters, `${dialog().data.filmId}.webp`)))
                            await downloadImage(`${TMDB_IMG_PATH}original${detail.poster_path}`, dialog().data.filmId, ImgSubfolder.Posters)
                    }

                    if (detail?.genres.length)
                        await tx.insertInto("filmTag")
                            .values(detail.genres.map(genre => ({
                                filmId: dialog().data.filmId,
                                tag: genre.name
                            })))
                            .onConflict(oc => oc.doNothing())
                            .execute()
                    return actors
                })

                for (const actor of actors) {
                    const img = credits.find(c => c.id === actor.tmdbId)?.profile_path;
                    if (!img) continue;
                    const imgExists = await exists(await join(await appDataDir(), "images", ImgSubfolder.Actors, `${actor.actorId}.webp`));
                    if (imgExists) continue;
                    await downloadImage(`${TMDB_IMG_PATH}original${img}`, actor.actorId, ImgSubfolder.Actors)
                }
            }
            revalidate([getFilms.key, getTags.key, getActors.key]);
            document.querySelector<HTMLButtonElement>('button[formmethod="dialog"')?.click();
        }
        catch (error) {
            state.status.setStatus("Error saving: " + error)
        }
        finally {
            props.setIsSaving(false)
        }
    }
    const display = () => 'title' in props.item ? { ...props.item } : {
        title: props.item.name,
        release_date: props.item.first_air_date,
        poster_path: props.item.poster_path
    }
    return (
        <div class={styles.result}>
            <img
                src={`${TMDB_IMG_PATH}original${props.item.poster_path}`}
                alt=""
                onerror={e => {
                    e.currentTarget.src = "/Question_Mark.svg"
                }}
            />
            <span>{display().title}</span>
            <span>{display().release_date}</span>
            <button
                class="button"
                disabled={props.isSaving()}
                onClick={tag}
            >
                Accept
                <CheckIcon />
            </button>
        </div>
    )
}

async function downloadImage(url: string, id: number, folder: ImgSubfolder) {
    const res = await fetch(url)
    const blob = await res.blob();
    const file = new File([blob], id.toString(), {
        type: blob.type,
    })
    saveImg(file, folder, id)
}