import { LoadPlaylistBtn } from "./LoadPlaylistBtn";
import { SavePlaylistBtn } from "./SavePlaylistBtn";
import { AddPlaylistFilesToDatabaseBtn } from "./AddPlaylistFilesToDatabaseBtn";
import { CleanPlaylistBtn } from "./CleanPlaylistBtn";
import { AddDirectoryBtn, AddDirectoryToDatabase } from "./AddDirectoryBtn";
import { ClearPlaylistBtn } from "./ClearPlaylistBtn";
import { Breadcrumbs } from "../Breadcrumb";
import { LoadVideosBtn } from "./LoadVideosBtn";
import { ShufflePlaylistBtn } from "./ShufflePlaylistBtn";
import { BackBtn, ForwardBtn } from "./NavArrowSvgs";
import { TOP_BAR_HEIGHT } from "~/constants";
import styles from "~/layouts/main-window/MainWindow.module.css"
import { ViewToggle } from "./ViewToggle";
import { AddItemBtn } from "./AddItemBtn";

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
                <AddItemBtn />
                <ViewToggle />
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

