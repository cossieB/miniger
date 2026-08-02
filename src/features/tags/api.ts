import { query } from "@solidjs/router"
import { allTags } from "~/repositories/tagRepository"

export const getTags = query(async () => {
    return allTags()
}, 'getTags')

