import { useNavigate } from "@solidjs/router";
import { BackArrow, ForwardArrow, House } from "../../icons";
import { LoadPlaylistBtn } from "./LoadPlaylistBtn";
import { SavePlaylistBtn } from "./SavePlaylistBtn";
import { AddPlaylistFilesToDatabaseBtn } from "./AddPlaylistFilesToDatabaseBtn";
import { CleanPlaylistBtn } from "./CleanPlaylistBtn";
import { AddDirectoryBtn } from "./AddDirectoryBtn";
import { ClearPlaylistBtn } from "./ClearPlaylistBtn";
import { AddToPlaylist } from "./AddToPlaylist";
import { Breadcrumbs } from "../Breadcrumb";

export function TopBar() {
    const navigate = useNavigate();
    return (
        <nav class="w-full h-8 bg-orange-500 flex pl-5 gap-5 [&>svg]:h-full text-orange-50">
            {/* Left Part */}
            <BackArrow onclick={() => navigate(-1)} />
            <ForwardArrow onclick={() => navigate(1)} />
            <Breadcrumbs />

            {/* Center Part */}
            <AddToPlaylist />

            {/* Right Part */}
            <LoadPlaylistBtn />
            <AddDirectoryBtn />
            <CleanPlaylistBtn />
            <AddPlaylistFilesToDatabaseBtn />
            <SavePlaylistBtn />
            <ClearPlaylistBtn />
        </nav>
    );
}