import { LoadPlaylistBtn } from "./LoadPlaylistBtn";
import { SavePlaylistBtn } from "./SavePlaylistBtn";
import { AddPlaylistFilesToDatabaseBtn } from "./AddPlaylistFilesToDatabaseBtn";
import { CleanPlaylistBtn } from "./CleanPlaylistBtn";
import { AddDirectoryBtn, AddDirectoryToDatabase } from "./AddDirectoryBtn";
import { ClearPlaylistBtn } from "./ClearPlaylistBtn";
import { AddToPlaylistBtn } from "./AddToPlaylist";
import { Breadcrumbs } from "../Breadcrumb";
import { DeleteBtn } from "./DeleteBtn";
import { LoadVideosBtn } from "./LoadVideosBtn";
import { ShufflePlaylistBtn } from "./ShufflePlaylistBtn";
import { BackBtn, ForwardBtn } from "./NavArrowSvgs";

export function TopBar() {

    return (
        <nav class="w-full h-8 bg-orange-500 flex pl-5 gap-5 [&>svg]:h-full text-orange-50">
            <div class="flex-1 flex h-full justify-start items-center gap-3">
                {/* Left Part */}
                <BackBtn />
                <ForwardBtn />
                <Breadcrumbs />
            </div>

            <div class="ml-auto flex-1 flex h-full justify-center items-center gap-3">
                {/* Center Part */}
                <AddDirectoryToDatabase />
                <AddToPlaylistBtn />
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

