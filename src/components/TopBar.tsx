import { useNavigate } from "@solidjs/router";
import { BackArrow, Eraser, ForwardArrow, House, PlayListSvg } from "../icons";
import { open } from "@tauri-apps/plugin-dialog"
import { invoke } from "@tauri-apps/api/core";
import { setState, state } from "../state";

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
            <Eraser
                onclick={async () => {
                    const filtered: any = await invoke('cleanup_playlist', {playlist: state.sidePanel.list})
                    setState('sidePanel', 'list', filtered)
                }} />
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