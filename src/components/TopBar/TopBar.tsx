import { useNavigate } from "@solidjs/router";
import { AddFolderSvg, BackArrow, BugSvg, ForwardArrow, House } from "../../icons";
import { LoadPlaylistBtn } from "./LoadPlaylistBtn";
import { SavePlaylistBtn } from "./SavePlaylistBtn";
import { AddPlaylistFilesToDatabaseBtn } from "./AddPlaylistFilesToDatabaseBtn";
import { CleanPlaylistBtn } from "./CleanPlaylistBtn";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { setState } from "../../state";

export function TopBar() {
    const navigate = useNavigate();
    return (
        <nav class="w-full h-8 bg-orange-500 flex pl-5 gap-5 [&>svg]:h-full text-orange-50">
            {/* Left Part */}
            <House onclick={() => navigate("/")} />
            <BackArrow onclick={() => navigate(-1)} />
            <ForwardArrow onclick={() => navigate(1)} />

            {/* Center Part */}
            

            {/* Right Part */}
            <LoadPlaylistBtn />
            <AddDirectoryBtn />
            <CleanPlaylistBtn />
            <AddPlaylistFilesToDatabaseBtn />
            <SavePlaylistBtn />
        </nav>
    );
}

export function AddDirectoryBtn() {
    return <AddFolderSvg
        title="Open Folder"
        onclick={async () => {
            const directory = await open({ directory: true });
            if (!directory) return;
            const t: {title: string, path: string}[] = await invoke('load_directory', {path: directory});
            setState('sidePanel', 'list', t)
        }}
    />
}