import { createAsync, query, revalidate } from "@solidjs/router";
import { invoke } from "@tauri-apps/api/core";
import { createEffect, createSignal, For, on, Suspense, type Accessor, type Setter } from "solid-js";
import { TMDBClient } from "~/features/tmdb/api";
import { cleanTitle } from "~/features/tmdb/utils/cleanTitle";
import { state } from "~/state";
import type { TMDBActorDialog } from "~/state/dialog";
import styles from "./ActorTMDB.module.css"
import { MyLoader } from "~/components/MyLoader";
import { TMDB_IMG_PATH } from "~/constants";
import { CheckIcon, XIcon } from "lucide-solid";
import type { UnwrapPromise } from "~/lib/utilityTypes";
import { db } from "~/kysely/database";
import { exists } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { ImgSubfolder } from "~/types";
import { downloadImage } from "~/utils/saveImg";
import { getActor, getActors } from "../api";
import { confirm } from "@tauri-apps/plugin-dialog";

const searchActor = query(async (name: string) => {
    if (!name) return { results: [] }
    const apiKey = await invoke<string>("get_password")
    const tmdbCient = new TMDBClient(apiKey);
    return tmdbCient.search(name, "person")
}, "tmdbActorSearch")

export function ActorTMDB() {

    const dialog = () => state.dialog.active as TMDBActorDialog
    const [searchTerm, setSearchTerm] = createSignal(cleanTitle(dialog().data.name));
    createEffect(on(dialog, d => setSearchTerm(cleanTitle(d.data.name))))
    const [isSaving, setIsSaving] = createSignal(false)
    const searchResult = createAsync(() => searchActor(searchTerm()))

    return (
        <form class={styles.autotag}>
            <div class={styles.inputs}>
                <label>Search query</label>
                <input type="text" value={searchTerm()} onChange={e => setSearchTerm(e.currentTarget.value)} />
                <button formMethod="dialog">
                    <XIcon />
                </button>
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
    item: NonNullable<UnwrapPromise<ReturnType<typeof searchActor>>>['results'][number]
    isSaving: Accessor<boolean>
    setIsSaving: Setter<boolean>
}

function SearchResult(props: Props) {
    const dialog = () => state.dialog.active as TMDBActorDialog

    async function tag() {
        props.setIsSaving(true)
        const apiKey = await invoke<string>("get_password")
        const tmdbCient = new TMDBClient(apiKey);
        let tmdbId!: number
        try {
            const detail = await tmdbCient.detail(props.item.id, "person")
            if (!detail) return;
            tmdbId = detail.id
            await db.updateTable("actor")
                .set({
                    name: detail.name,
                    gender: detail.gender === 1 ? "F" : detail.gender === 2 ? "M" : undefined,
                    dob: detail.birthday,
                    tmdbId: detail.id
                })
                .where("actor.actorId", "=", dialog().data.actorId)
                .execute()

            const imgExists = await exists(await join(await appDataDir(), "images", ImgSubfolder.Actors, `${dialog().data.actorId}.webp`));
            if (detail.profile_path && !imgExists)
                await downloadImage(`${TMDB_IMG_PATH}original${detail.profile_path}`, dialog().data.actorId, ImgSubfolder.Actors)
            await revalidate([getActors.key, getActor.keyFor(dialog().data.actorId)])
            document.querySelector<HTMLButtonElement>('button[formmethod="dialog"')?.click();
        }
        catch (error: any) {
            if (typeof error == "string" && error.includes("(code: 2067)")) {
                const existingActor = await db.selectFrom("actor").selectAll().where("actor.tmdbId", "=", tmdbId).executeTakeFirstOrThrow();
                const userConfirmed = await confirm(`There is a conflict between selected actor (${dialog().data.name}) and another actor (${existingActor.name}). Save changes anyway? Doing so may cause your database to have incorrect information`)
                if (!userConfirmed) return;
                await db.transaction().execute(async tx => {
                    await tx.updateTable("actor")
                        .set({
                            tmdbId: null
                        })
                        .where("tmdbId", "=", tmdbId)
                        .execute()
                    await tx.updateTable("actor")
                        .set({
                            tmdbId
                        })
                        .where("actorId", "=", dialog().data.actorId)
                        .execute()
                })
                return
            }
            console.error(error)
            state.status.setStatus("Error saving: " + error)
        }
        finally {
            props.setIsSaving(false)
        }
    }

    return (
        <div class={styles.result}>
            <img
                src={`${TMDB_IMG_PATH}original${props.item.profile_path}`}
                alt=""
                onerror={e => {
                    e.currentTarget.src = "/Question_Mark.svg"
                }}
            />
            <span>{props.item.name}</span>
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