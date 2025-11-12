import Database from "@tauri-apps/plugin-sql";
import { CamelCasePlugin, Kysely } from "kysely";
import { TauriSqliteDialect } from "kysely-dialect-tauri";
import { DB } from "./schema";

export const db = new Kysely<DB>({
    dialect: new TauriSqliteDialect({
        database: async prefix => {
            const db = await Database.load("sqlite:mngr.db")
            await db.execute("PRAGMA foreign_keys=ON")
            return db
        }
    }),
    plugins: [new CamelCasePlugin()],
    log: ["query", "error"]
})