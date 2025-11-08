import {defineConfig} from "drizzle-kit";

export default defineConfig({
    dialect: "sqlite",
    dbCredentials: {
        url: "./test.db",
    },
    out: "./src-tauri/migrations"
})