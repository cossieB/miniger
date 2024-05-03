import { useNavigate } from "@solidjs/router";
import { AddToDatabaseSvg, BackArrow, BroomSvg, ForwardArrow, House, PlayListSvg, SaveSvg } from "../icons";
import { open, save } from "@tauri-apps/plugin-dialog"
import { invoke } from "@tauri-apps/api/core";
import { setState, state } from "../state";
import { db } from "../App";

export function TopBar() {
    const navigate = useNavigate();
    return (
        <nav class="w-full h-8 bg-orange-500 flex pl-5 gap-5 [&>svg]:h-full text-orange-50">
            <House onclick={() => navigate("/")} />
            <BackArrow onclick={() => navigate(-1)} />
            <ForwardArrow onclick={() => navigate(1)} />

            <PlayListSvg
                class="ml-auto"
                onclick={async () => {
                    const selection = await open({
                        title: "Select a playlist",
                        filters: [{
                            name: "Playlist files",
                            extensions: ["mpcpl", "asx", "m3u", "pls"]
                        }]
                    })
                    if (!selection) return;
                    try {
                        const t: { title: string, path: string }[] = await invoke("read_playlist", {
                            playlist: selection.path
                        })
                        setState('sidePanel', 'list', t)
                    }
                    catch (error) {
                        setState('status', error as string);
                        setTimeout(() => {
                            setState('status', "")
                        }, 5000)
                    }
                }} />
            <BroomSvg
                onclick={async () => {
                    const filtered: any = await invoke('cleanup_playlist', { playlist: state.sidePanel.list })
                    setState('sidePanel', 'list', filtered)
                }}
            />
            <AddToDatabaseSvg
                onclick={async () => {
                    try {
                        db()?.select("BEGIN")
                        for (const item of state.sidePanel.list)
                            await db()?.execute("INSERT into film (title, path) VALUES ($1, $2) ON CONFLICT (path) DO NOTHING", [item.title, item.path])    
                        db()?.select("COMMIT")
                    } 
                    catch (error) {
                        console.error(error)
                        db()?.select("ROLLBACK")
                    }
                }}
            />
            <SaveSvg
                class="mr-5"
                classList={{ 'fill-zinc-500': state.sidePanel.list.length == 0 }}
                onclick={async () => {
                    if (state.sidePanel.list.length == 0) return;
                    try {
                        const path = await save({
                            title: "Save playlist",
                            filters: [{
                                name: "Winamp Playlist",
                                extensions: ["m3u", "m3u8"],
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
                        if (path)
                            await invoke('save_playlist', { path, files: state.sidePanel.list })
                    } catch (error) {
                        setState('status', error as string)
                    }
                }}
            />
        </nav>
    );
}

export function BottomBar() {
    return (
        <div class="w-full h-8 bg-orange-500 pl-5">
            {state.status}
        </div>
    )
}