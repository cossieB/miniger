import { useContext } from "solid-js"
import { MovieGridContext } from "../contexts/MovieGridContext"

export function useMovieGridContext() {
    const context = useContext(MovieGridContext)
    if (!context) throw new Error("Movie Grid needs to be a descendant of MovieGridProvider")
    return context
}