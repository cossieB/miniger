import { useAction, useSubmission } from "@solidjs/router"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { open } from "@tauri-apps/plugin-dialog"
import { BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs"
import { Loader, Trash2Icon } from "lucide-solid"
import { createResource, createSignal, For, onMount, Show } from "solid-js"
import { readDirectories } from "~/features/movies/utils/readDirectories"
import styles from "./Windows.module.css"
import { addFilesToDatabase } from "~/features/movies/api"

export function Settings() {
    let scanNowBtn!: HTMLButtonElement
    const [hasChanged, setHasChanged] = createSignal(false)
    const [data, { mutate, refetch }] = createResource(readFile, {
        initialValue: []
    })
    onMount(() => {
        scanNowBtn.focus()
    })
    const action = useAction(addFilesToDatabase)
    const submissions = useSubmission(addFilesToDatabase)
    return (
        <div 
            class={styles.settings}            
        >
            <span>Folders</span>
            <button                
                disabled={submissions.pending}
                onclick={async () => {
                    const dirs = await open({ multiple: true, directory: true });
                    if (!dirs?.length) return;
                    mutate(p => [...p, ...dirs.map(x => ({ path: x, scanOnStart: true }))]);
                    setHasChanged(true);
                }}>
                Add Folder
            </button>
            <Show when={!hasChanged()}>
                <button
                    ref={scanNowBtn}
                    disabled={submissions.pending}
                    onclick={async () => {
                        const files = await readDirectories(data().map(x => x.path))
                        if (!files?.length) return;
                        const window = getCurrentWindow()
                        window.emitTo("main", "set-status", "Scanning for new files");
                        await action(files);
                        await window.emitTo("main", "update-films");
                        window.close()
                    }}
                >
                    Scan Now
                </button>
            </Show>
            <table>
                <thead>
                    <tr>
                        <th>Folder</th>
                        <th>Scan on startup</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <For each={data()}>
                        {(item, i) =>
                            <tr>
                                <td> {item.path} </td>
                                <td>
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
                                    <button
                                        onclick={() => {
                                            mutate(p => p.filter((_, j) => j != i()))
                                            setHasChanged(true);
                                        }}>
                                        <Trash2Icon color="red" />
                                    </button>
                                </td>
                            </tr>
                        }
                    </For>
                </tbody>
            </table>
            <div>
                <button   
                    disabled={submissions.pending}         
                    onclick={async () => {
                        await writeTextFile("watch.json", JSON.stringify(data()), {
                            baseDir: BaseDirectory.AppData
                        })
                        setHasChanged(false)
                    }}>
                    Save
                </button>
                <button
                    disabled={submissions.pending}
                    onclick={async () => {
                        await refetch()
                        setHasChanged(false)
                    }}
                >
                    Reset
                </button>
            </div>
            <Show when={submissions.pending}>
                <div class={`${styles.loader}`}>
                    <Loader class="animate-spin" />
                </div>
            </Show>
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