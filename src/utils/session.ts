import z from "zod"

const SortCriterionSchema = z.array(z.object({
    id: z.enum(["title", "releaseDate", "path", "studioName", "dateAdded", "duration", "size", "bit_rate"]).catch("title"),
    desc: z.boolean().default(false)
})).default([]).catch([])

export const SessionSchema = z.object({
    list: z.array(z.object({
        path: z.string(),
        title: z.string()
    })).catch([]).default([]),
    treeWidth: z.number().min(0.05).max(0.25).default(0.10).catch(0.10),
    sidePanelWidth: z.number().min(0.05).max(0.25).default(0.10).catch(0.10),
    location: z.string().regex(/^\/(movies|actors|studios|tags|play)/i).default("/").catch("/"),
    view: z.enum(["grid", "table"]).default("grid").catch("grid"),
    sort: SortCriterionSchema
})

export type SessionJSON = z.infer<typeof SessionSchema>