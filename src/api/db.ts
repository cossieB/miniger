import Database from "@tauri-apps/plugin-sql";

export async function getDatabase() {
    const connection = await Database.load("sqlite:mngr.db")
    await connection.execute("PRAGMA foreign_keys = ON")
    return {
        connection,
        [Symbol.asyncDispose]: async () => {
            await connection.close();
        }
    }
}