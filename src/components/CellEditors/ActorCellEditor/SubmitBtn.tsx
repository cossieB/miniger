import { Accessor } from "solid-js";
import { Actor } from "../../../datatypes";
import Database from "@tauri-apps/plugin-sql";

type Props = {
    rowActors: Accessor<Actor[]>;
    film_id: string;
    stopEditing(): void;
};
export function SubmitBtn(props: Props) {
    return (
        <button class="flex h-10 w-full items-center justify-center bg-green-600"
            onclick={async () => {
                const db = await Database.load("sqlite:mngr.db");
                try {
                    await db.select("BEGIN");
                    await db.select("DELETE FROM actor_film WHERE film_id = $1", [props.film_id]);
                    for (const actor of props.rowActors()) {
                        await db.select("INSERT INTO actor_film (film_id, actor_id) VALUES ($1, $2)", [props.film_id, actor.actor_id]);
                    }
                    await db.select("COMMIT");
                    props.stopEditing();
                }
                catch (error) {
                    await db.select("ROLLBACK");
                }
                props.stopEditing();
            }}
        >
            SUBMIT
        </button>
    );
}
