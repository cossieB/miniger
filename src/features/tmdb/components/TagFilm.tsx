import { createAsync, query } from "@solidjs/router"
import { TMDBClient } from "../api"
import { cleanTitle } from "../utils/cleanTitle";
import { state } from "~/state";
import type { TMDBFilmDialog } from "~/state/dialog";
import { invoke } from "@tauri-apps/api/core";
import { createSignal, For, Suspense } from "solid-js";
import styles from "./TMDB.module.css"
import { MyLoader } from "~/components/MyLoader";
import { CheckIcon } from "lucide-solid";
import type { UnwrapPromise } from "~/lib/utilityTypes";

const dummy = [
    {
        "id": 101,
        "title": "Inception",
        "release_date": "2010-07-16",
        "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"
    },
    {
        "id": 102,
        "title": "Interstellar",
        "release_date": undefined,
        "poster_path": null
    }
]


const searchFilm = query(async (title: string, isTv = false) => {
    return { results: dummy }
    if (!title) return { results: [] }
    const apiKey = await invoke<string>("get_password")
    const tmdbCient = new TMDBClient(apiKey);
    if (isTv) return tmdbCient.search(title, "tv")
    return tmdbCient.search(title, "movie")
}, "tmdbFilmSearch")

export function TagFilm() {
    const dialog = () => state.dialog.active as TMDBFilmDialog
    const [searchTerm, setSearchTerm] = createSignal(cleanTitle(dialog().data.title))
    const [isTv, setIsTv] = createSignal(false)
    const searchResult = createAsync(() => searchFilm(searchTerm(), isTv()))
    return (
        <div class={styles.autotag}>
            <aside> {dialog().data.path} </aside>
            <div class={styles.inputs}>
                <label>Search query</label>
                <input type="text" value={searchTerm()} onChange={e => setSearchTerm(e.currentTarget.value)} />
                <label>TV</label>
                <input type="checkbox" checked={isTv()} onChange={e => setIsTv(e.currentTarget.checked)} class="volt-switch" name="" id="" />
            </div>
            <Suspense fallback={<MyLoader />}>
                <div class={styles.results}>
                    <For each={searchResult()?.results}>
                        {item =>
                            <SearchResult
                                item={item}
                            />
                        }
                    </For>
                </div>
            </Suspense>
        </div>
    )
}

type Props = {
    item: NonNullable<UnwrapPromise<ReturnType<typeof searchFilm>>>['results'][number]
}

function SearchResult(props: Props) {
    const dialog = () => state.dialog.active as TMDBFilmDialog
    async function tag() {
        const apiKey = await invoke<string>("get_password")
        const tmdbCient = new TMDBClient(apiKey);
        const credits = await tmdbCient.movieCredits(props.item.id);
        const detail = await tmdbCient.detail(props.item.id, "movie")
    }
    const display = () => 'title' in props.item ? { ...props.item } : {
        title: props.item.name,
        release_date: props.item.first_air_date,
        poster_path: props.item.poster_path
    }
    return (
        <div class={styles.result}>
            <img
                src={`https://image.tmdb.org/t/p/original${props.item.poster_path}`}
                alt=""
                onerror={e => {
                    e.currentTarget.src = "/Question_Mark.svg"
                }}
            />
            <span>{display().title}</span>
            <span>{display().release_date}</span>
            <button class="button">
                Accept
                <CheckIcon />
            </button>
        </div>
    )
}