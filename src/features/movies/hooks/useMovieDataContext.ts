import { useContext } from "solid-js";
import { MovieDataContext } from "../contexts/MovieDataContext";

export function useMovieDataContext() {
    const ctx = useContext(MovieDataContext)
    if (!ctx) throw new Error("Component needs to be a child of MovieDataProvider")
    return ctx
}