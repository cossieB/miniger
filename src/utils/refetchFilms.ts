import { revalidate } from "@solidjs/router";
import { getFilms } from "~/api/data";

export function refetchFilms() {
    return revalidate(getFilms.key)
}