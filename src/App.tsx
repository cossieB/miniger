import { createStore } from "solid-js/store";
import Database from "@tauri-apps/plugin-sql";
import { Nav } from "./components/Nav";
import { TopBar } from "./components/TopBar";
import { JSXElement } from "solid-js";

function App(props: {children?: JSXElement}) {

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

function SidePanel() {
    return (
        <section class="bg-gray-800 flex-1 basis-14">
        </section>
    )
}

