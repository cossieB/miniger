import { useNavigate } from "@solidjs/router";
import { BackArrowSvg, ForwardArrowSvg, ShuffleSvg } from "../../icons";
import { LoadPlaylistBtn } from "./LoadPlaylistBtn";
import { SavePlaylistBtn } from "./SavePlaylistBtn";
import { AddPlaylistFilesToDatabaseBtn } from "./AddPlaylistFilesToDatabaseBtn";
import { CleanPlaylistBtn } from "./CleanPlaylistBtn";
import { AddDirectoryBtn, AddDirectoryToDatabase } from "./AddDirectoryBtn";
import { ClearPlaylistBtn } from "./ClearPlaylistBtn";
import { AddToPlaylist } from "./AddToPlaylist";
import { Breadcrumbs } from "../Breadcrumb";
import { state } from "../../state";
import { DeleteBtn } from "./DeleteBtn";
import { LoadVideosBtn } from "./LoadVideosBtn";

export function TopBar() {
    const navigate = useNavigate();
    return (
        <nav class="w-full h-8 bg-orange-500 flex pl-5 gap-5 [&>svg]:h-full text-orange-50">
            <div class="flex-1 flex h-full justify-start items-center gap-3">
                {/* Left Part */}
                <BackArrowSvg onclick={() => navigate(-1)} />
                <ForwardArrowSvg onclick={() => navigate(1)} />
                <Breadcrumbs />
            </div>

            <div class="ml-auto flex-1 flex h-full justify-center items-center gap-3">
                {/* Center Part */}
                <AddDirectoryToDatabase />
                <AddToPlaylist />
                <DeleteBtn />
            </div>

            <div class="ml-auto flex-1 flex h-full justify-end items-center gap-3">
                {/* Right Part */}
                <LoadVideosBtn />
                <LoadPlaylistBtn />
                <AddDirectoryBtn />
                <CleanPlaylistBtn />
                <AddPlaylistFilesToDatabaseBtn />
                <SavePlaylistBtn />
                <ShufflePlaylistBtn />
                <ClearPlaylistBtn />
            </div>
        </nav>
    );
}

function ShufflePlaylistBtn() {
    return (
        <ShuffleSvg
            title="Shuffle Playlist"
            classList={{ 'fill-zinc-500': state.sidePanel.list.length == 0 }}
            onClick={state.sidePanel.shuffle}
        />
    )
}