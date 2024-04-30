import { createStore } from "solid-js/store";
import Database from "@tauri-apps/plugin-sql";
import { Nav } from "./components/Nav";
import { TopBar } from "./components/TopBar";
import { JSXElement, createEffect, createResource } from "solid-js";
import { resolveResource } from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { SidePanel } from "./SidePanel";

const [db] = createResource(() => Database.load("sqlite:mngr.db"))

function App(props: {children?: JSXElement}) {
    createEffect(() => {
        if (!db()) return;
        (async function () {
            try {
                const script = await readTextFile(await resolveResource("./schema.sql"));
                db()!.execute(script)
            } catch (error) {
                console.error(error)
            }
        })()
    })
    
    return (
        <div class="h-screen w-screen text-white">
            <TopBar />
            <div class="w-screen flex">
            <Nav />
            <main class="basis-96 flex-[2] bg-slate-900">
                {props.children} 
            </main>
            <SidePanel />
            </div>
        </div>
    );
}

export default App;


const [selection, setSelection] = createStore<{path: string, filename: string}[]>([])


async function getFilms() {
    const db = await Database.load("sqlite:mngr.db");
    return (await db.select("SELECT * FROM film") as {path: string, filename: string, release_date: Date}[])
}


