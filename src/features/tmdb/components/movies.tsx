import { Navigate } from "@solidjs/router";
import { For, Show, Suspense } from "solid-js";
import { getFilms } from "../../movies";
import styles from "./TMDBGrid.module.css"
import { cleanTitle } from "../utils/cleanTitle";
import { invoke } from "@tauri-apps/api/core";
import { TMDBClient } from "../api";
import { createStore } from "solid-js/store";

type Film = {
    title: string,
    filmId: number
}

const apiKey = await invoke<string>('get_password');

const f = await getFilms()
const [films, setFilms] = createStore(f.map(film => ({
    title: film.title,
    filmId: film.filmId,
    poster_path: "",
    tags: "",
    release_date: "",
    actors: [] as { name: string }[]
})))

const tmdbClient = new TMDBClient(apiKey)

for (let start = 0; start < films.length; start += 10) {
    const chunk = films.slice(start, start + 10);
    const processed = await Promise.all(chunk.map(f => process(f)))
    processed.forEach((f, i) => {
        if (!f) return;
        setFilms(prev => {
            prev[start + i] = { ...prev[start + i], ...f }
            return [...prev]
        })
    })
}    
async function process(film: Film) {
    const result = await tmdbClient.search(cleanTitle(film.title), "movie");
    const m = result?.results.at(0)
    if (!m) {
        return
    }
    const b = await tmdbClient.detail(m.id, "movie")
    if (!b) return
    const actors = await tmdbClient.movieCredits(m.id);
    return {
        ...b,
        actors,
    }
}

export function SearchMovies() {

    return (
        <Show when={apiKey}
            fallback={<Navigate href={"/"} />}
        >
            <Suspense>
                <div class={styles.tmdb}>
                    <div class={styles.check}>
                        <input type="checkbox" name="" id="" />
                    </div>
                    <div>Movie</div>
                    <div>Poster</div>
                    <div>TV?</div>
                    <div>Tags</div>
                    <div>Release Date</div>
                    <div>Actors</div>
                    <For each={films}>
                        {film => <MovieRow
                            {...film}
                            isTv={false}
                        />}
                    </For>
                </div>
            </Suspense>
        </Show>
    )
}

type Props = {
    title: string
    poster_path: string
    isTv: boolean
    tags: string,
    release_date: string
    actors: { name: string }[]
};

function MovieRow(props: Props) {
    return (
        <>
            <div class={styles.check}>
                <input type="checkbox" name="" id="" />
            </div>
            <div>{cleanTitle(props.title)}</div>
            <div class={styles.posterWrapper}>
                <img src={props.poster_path && `https://image.tmdb.org/t/p/original/${props.poster_path}`} alt="" />
            </div>
            <div class={styles.check}>
                <input type="checkbox" name="" id="" />
            </div>
            <div>
                {props.tags}
            </div>
            <div> {props.release_date} </div>
            <div> {props.actors.map(x => x.name).join("; ")} </div>
        </>
    )
}

