import { invoke } from "@tauri-apps/api/core"
import { sql } from "kysely"
import { db } from "~/kysely/database"
import { getFilmsWithoutMetadata } from "~/repositories/filmsRepository"
import { state } from "~/state"

type FfprobeMetadata = {
    filmId: number,
    metadata: {
        streams: {
            codec_name: string,
            code_type: string,
            width: number | null,
            height: number | null
        }[]
        format: {
            duration: string,
            size: string,
            bit_rate: string
        }
    }
}

export async function updateMetadata() {
    const videos = await getFilmsWithoutMetadata()
    const result: FfprobeMetadata[] = await invoke("get_metadata", { videos: videos })
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
        state.status.setStatus("metadata complete")
        return
    }
    try {
        await db.schema.createTable("temp_film")
            .temporary()
            .addColumn("film_id", "integer")
            .addColumn("metadata", "text")
            .execute()

        await db.insertInto("temp_film").values(arr).execute()

        await sql`UPDATE film SET metadata = temp.metadata FROM temp_film temp WHERE film.film_id = temp.film_id`.execute(db)

        state.status.setStatus("metadata complete")
    } catch (error) {
        console.error(error)
        state.status.setStatus("Failure")
    }
}