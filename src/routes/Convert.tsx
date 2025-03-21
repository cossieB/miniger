import { invoke } from "@tauri-apps/api/core"
import { open, save } from "@tauri-apps/plugin-dialog"
import { createSignal } from "solid-js"

export function Convert() {
    const [source, setSource] = createSignal("")
    const [destination, setDestination] = createSignal("")
    const [isBusy, setIsBusy] = createSignal(false)
    const [message, setMessage] = createSignal("")

    return (
        <div class="w-screen h-screen bg-slate-800 z-[999] absolute p-2 overflow-y-auto scroll text-white">
            <div
                class="grid grid-cols-[auto_1fr] gap-2 items-center"
            >
                <button
                    class="bg-slate-700 rounded-sm p-1 w-full shadow-black shadow-2xs"
                    onclick={async () => {
                        setMessage("")
                        const selection = await open({
                            title: "Source Playlist",
                            filters: [{
                                name: "Playlist File",
                                extensions: ["m3u", "m3u8", "asx", "pls", "mpcpl"]
                            }]
                        })
                        selection && setSource(selection)
                    }}
                >
                    Select Source File
                </button >
                <span>
                    {source()}
                </span>
                <button
                    class="bg-slate-700 rounded-sm p-1 w-full shadow-black shadow-2xs"
                    onclick={async () => {
                        setMessage("")
                        const selection = await save({
                            title: "Save Playlist",
                            filters: [{
                                name: "Winamp Playlist",
                                extensions: ["m3u"],
                            }, {
                                name: "Windows Media Playlist",
                                extensions: ["asx"],
                            }, {
                                name: "Playlist",
                                extensions: ["pls"],
                            }, {
                                name: "MPC Playlist",
                                extensions: ["mpcpl"],
                            }]
                        })
                        selection && setDestination(selection)
                    }}

                >
                    Select Destination
                </button>
                <span>
                    {destination()}
                </span>
                <button
                    disabled={!source() || !destination() || isBusy()}
                    class="bg-orange-500 rounded-sm col-span-2 w-[75%] justify-self-center disabled:bg-gray-300 disabled:text-black disabled:cursor-not-allowed"
                    onclick={async () => {
                        setIsBusy(true)
                        try {
                            await invoke("convert_playlist", {
                                source: source(),
                                destination: destination(),
                            })
                            setMessage("Conversion complete");
                            setSource("")
                            setDestination("")
                        } 
                        catch (error: any) {
                            console.error(error)
                            setMessage("Conversion error: " + error.message)
                        }
                        finally {
                            setIsBusy(false);
                        }
                    }}>
                    Save
                </button>
            </div>
            <span>
                {message()}
            </span>
        </div>
    )
}