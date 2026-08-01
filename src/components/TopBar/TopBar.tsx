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
import { TOP_BAR_HEIGHT } from "~/constants";
import styles from "~/windows/MainWindow.module.css"

export function TopBar() {

    return (
        <nav
            class={styles.topbar}
            style={{
                height: TOP_BAR_HEIGHT + "px"
            }}
        >
            <div>
                {/* Left Part */}
                <BackBtn />
                <ForwardBtn />
                <Breadcrumbs />
            </div>

            <div>
                {/* Center Part */}
                <AddDirectoryToDatabase />
                <AddToPlaylistBtn />
                <DeleteBtn />
            </div>

            <div>
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

