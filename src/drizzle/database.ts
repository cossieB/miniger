import { drizzle } from "drizzle-orm/sqlite-proxy";
import Database from "@tauri-apps/plugin-sql";
import * as schema from "./schema";
import * as relations from "./relations";

export async function getDb() {
    return await Database.load("sqlite:mngr.db");
}

export const db = drizzle<typeof schema>(
    async (sql, params, method) => {
        const sqlite = await getDb();
        let rows: any = [];
        let results = [];
        console.log(sql);
        // If the query is a SELECT, use the select method
        if (isSelectQuery(sql) || isWithQuery(sql)) {
            rows = await sqlite.select(sql, params).catch((e) => {
                console.error("SQL Error:", e);
                return [];
            });
        } 
        
        else {
            // Otherwise, use the execute method
            rows = await sqlite.execute(sql, params).catch((e) => {
                console.error("SQL Error:", e);
                return [];
            });
            return { rows: [] };
        }

        rows = rows.map((row: any) => {
            return Object.values(row);
        });

        // If the method is "all", return all rows
        results = method === "all" ? rows : rows[0];
        await sqlite.close();
        return { rows: results };
    },
    // Pass the schema to the drizzle instance
    { schema: {...schema, ...relations}, logger: true }
);

/**
 * Checks if the given SQL query is a SELECT query.
 * @param sql The SQL query to check.
 * @returns True if the query is a SELECT query, false otherwise.
 */
function isSelectQuery(sql: string): boolean {
    const selectRegex = /^\s*(SELECT|DELETE)\b/i;
    return selectRegex.test(sql);
}

function isWithQuery(sql: string): boolean {
    const selectRegex = /^\s*WITH\b/i;
    return selectRegex.test(sql);    
}

function isTransaction(sql: string): boolean {
    return /^s*(BEGIN|COMMIT)\b/i.test(sql);
}