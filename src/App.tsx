import Database from "@tauri-apps/plugin-sql";
import { Nav } from "./components/Nav";
import { BottomBar, TopBar } from "./components/TopBar";
import { JSXElement, createEffect, createResource, onCleanup, onMount } from "solid-js";
import { resolveResource } from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { SidePanel } from "./sidePanel/SidePanel";
import { setState, state } from "./state";

const [db] = createResource(() => Database.load("sqlite:mngr.db"))

function App(props: { children?: JSXElement }) {
    createEffect(() => {
        if (!db()) return;
        (async function () {
            try {
                const script = await readTextFile(await resolveResource("./schema.sql"));
                db()!.execute(script)
            } 
            catch (error) {
                console.error(error)
            }
        })()
    })
    function handleKeyup(e: KeyboardEvent) {
        e.preventDefault();
        if (e.key == 'Delete') {
            setState('sidePanel', prev => ({
                list: prev.list.filter((_item, i) => !state.sidePanel.selections.has(i)),
                lastSelection: 0
            }))
            state.sidePanel.selections.clear()
        }
    }
    onMount(() => {
        document.addEventListener('keyup', handleKeyup);
    })
    onCleanup(() => {
        document.removeEventListener("keyup", handleKeyup);
    })

    return (
        <div class="h-screen w-screen text-white">
            <TopBar />
            <div class="w-screen flex" style={{height: "calc(100vh - 4rem"}}>
                <Nav />
                <main class="basis-96 flex-[2] bg-slate-900">
                    {props.children}
                </main>
                <SidePanel />
            </div>
            <BottomBar />
        </div>
    );
}

export default App;


async function getFilms() {
    const db = await Database.load("sqlite:mngr.db");
    return (await db.select("SELECT * FROM film") as { path: string, title: string, release_date: Date }[])
}