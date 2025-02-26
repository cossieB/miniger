import { useAction } from "@solidjs/router"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { open } from "@tauri-apps/plugin-dialog"
import { BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs"
import { createResource, For, onMount } from "solid-js"
import { addDirectoriesToDatabase } from "~/api/mutations"
import { TrashSvg } from "~/icons"
import { readWatchJson } from "~/readSettings"
import { readDirectories } from "~/utils/readDirectories"

export function Settings() {
    const [data, { mutate, refetch }] = createResource(readFile, {
        initialValue: []
    })
    onMount(() => {
        document.querySelectorAll("nav").forEach(el => el.remove())
    })
    const action = useAction(addDirectoriesToDatabase)
    return (
        <div class="w-screen h-screen bg-slate-800 z-[999] absolute p-2 overflow-y-auto scroll" 
            style={{"scrollbar-gutter": "stable"}}
        >
            <span>Folders</span>
            <button
                class="bg-slate-700 rounded-sm float-end p-1"
                onclick={async () => {
                    const dirs = await open({ multiple: true, directory: true });
                    if (!dirs?.length) return;
                    mutate(p => [...p, ...dirs.map(x => ({ path: x, scanOnStart: true }))]);
                }}>
                Add Folder
            </button>
            <button
                class="bg-slate-700 rounded-sm float-end p-1 mr-1"
                onclick={async () => {
                    const files = await readDirectories(data().map(x => x.path))
                    if (!files?.length) return;
                    await action(files);
                    const window = getCurrentWindow()
                    await window.emitTo("main", "update-films")
                }}
            >
                Scan Now
            </button>
            <table class="table-fixed w-full">
                <thead>
                    <tr>
                        <th class="w-3/4">Folder</th>
                        <th>Scan on startup</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <For each={data()}>
                        {(item, i) =>
                            <tr>
                                <td class="text-ellipsis overflow-hidden pr-2.5 text-nowrap w-3/4"> {item.path} </td>
                                <td class="text-center">
                                    <input
                                        type="checkbox"
                                        checked={item.scanOnStart}
                                        onchange={(e) => {
                                            mutate(p => {
                                                p[i()].scanOnStart = e.currentTarget.checked;
                                                return p
                                            })
                                        }}
                                    />
                                </td>
                                <td>
                                    <button onclick={() => mutate(p => p.filter((f, j) => j != i() ))}>
                                        <TrashSvg />
                                    </button>
                                </td>
                            </tr>
                        }
                    </For>
                </tbody>
            </table>
            <button
                class="bg-lime-700 rounded-sm float-end p-1"
                onclick={async () => {
                    await writeTextFile("watch.json", JSON.stringify(data()), {
                        baseDir: BaseDirectory.AppData
                    })
                }}>
                Save
            </button>
            <button
                class="bg-red-700 rounded-sm float-end p-1"
                onclick={refetch}
            >
                Reset
            </button>
        </div>
    )
}

async function readFile() {
    try {
        const text = await readTextFile("watch.json", {
            baseDir: BaseDirectory.AppData
        })
        return JSON.parse(text) as WatchJSON[]
    }
    catch (error) {
        return []
    }
}

export type WatchJSON = {
    path: string
    scanOnStart: boolean
}