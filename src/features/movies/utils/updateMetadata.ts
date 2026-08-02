import { invoke } from "@tauri-apps/api/core"
import { sql } from "kysely"
import { db } from "~/kysely/database"
import { state } from "~/state"
import { refetchFilms } from "../api"

export type FfprobeMetadata = {
    filmId: number,
    metadata: {
        streams: ({
            codec_name: string,
            codec_type: "video",
            width: number,
            height: number
        } | {
            codec_name: string,
            codec_type: "audio",
            width: null,
            height: null
        })[]
        format: {
            duration: string,
            size: string,
            bit_rate: string
        }
    }
}

export async function updateMetadata(videos: {
    filmId: number;
    path: string;
}[]) {

    const result: FfprobeMetadata[] = await invoke("get_metadata", { videos })
    state.status.setStatus("Updating database")
    const arr = result.map(x => ({
        filmId: x.filmId,
        metadata: JSON.stringify({
            ...x.metadata,
            format: {
                duration: Number(x.metadata.format.duration),
                size: Number(x.metadata.format.size),
                bit_rate: Number(x.metadata.format.bit_rate),
            }
        })
    }))
    if (arr.length == 0) {
        state.status.setStatus("✓ Updated metadata", true)
        return
    }
    try {
        await db.schema.createTable("temp_film")
            .temporary()
            .addColumn("film_id", "integer")
            .addColumn("metadata", "text")
            .execute()

        // @ts-expect-error 
        await db.insertInto("temp_film").values(arr).execute()
        await sql`UPDATE film SET metadata = temp.metadata FROM temp_film temp WHERE film.film_id = temp.film_id`.execute(db)
        await db.schema.dropTable("temp_film").execute()
        state.status.setStatus("✓ Updated metadata", true)
        refetchFilms()
    } catch (error) {
        console.error(error)
        state.status.setStatus("Failure")
    }
}