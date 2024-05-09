import { AddToDatabaseSvg } from "../../icons";
import { state } from "../../state";
import { db } from "../..";

export function AddPlaylistFilesToDatabaseBtn() {
    return <AddToDatabaseSvg
        onclick={async () => {
            try {
                db()?.select("BEGIN");
                for (const item of state.sidePanel.list)
                    await db()?.execute("INSERT into film (title, path) VALUES ($1, $2) ON CONFLICT (path) DO NOTHING", [item.title, item.path]);
                db()?.select("COMMIT");
            }
            catch (error) {
                console.error(error);
                db()?.select("ROLLBACK");
            }
        }} />;
}
