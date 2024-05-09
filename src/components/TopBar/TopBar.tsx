import { useNavigate } from "@solidjs/router";
import { BackArrow, BugSvg, ForwardArrow, House } from "../../icons";
import { LoadPlaylistBtn } from "./LoadPlaylistBtn";
import { SavePlaylistBtn } from "./SavePlaylistBtn";
import { AddPlaylistFilesToDatabaseBtn } from "./AddPlaylistFilesToDatabaseBtn";
import { CleanPlaylistBtn } from "./CleanPlaylistBtn";
import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";

export function TopBar() {
    const navigate = useNavigate();
    return (
        <nav class="w-full h-8 bg-orange-500 flex pl-5 gap-5 [&>svg]:h-full text-orange-50">
            {/* Left Part */}
            <House onclick={() => navigate("/")} />
            <BackArrow onclick={() => navigate(-1)} />
            <ForwardArrow onclick={() => navigate(1)} />

            {/* Center Part */}
            <BugSvg onclick={() => navigate("/inaccessible")} />

            {/* Right Part */}
            <LoadPlaylistBtn />
            <CleanPlaylistBtn />
            <AddPlaylistFilesToDatabaseBtn />
            <SavePlaylistBtn />
        </nav>
    );
}

function SearchInaccessible() {
    return <BugSvg
        class="ml-auto"
        onclick={async () => {
            const db = await Database.load("sqlite:mngr.db");
            const films = await db.select("SELECT title, path FROM film")
            const res = await invoke('get_inaccessible', { playlist: films });
            console.log(res)
        }}
    />
}