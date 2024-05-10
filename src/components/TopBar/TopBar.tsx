import { useNavigate } from "@solidjs/router";
import { BackArrow, BugSvg, ForwardArrow, House } from "../../icons";
import { LoadPlaylistBtn } from "./LoadPlaylistBtn";
import { SavePlaylistBtn } from "./SavePlaylistBtn";
import { AddPlaylistFilesToDatabaseBtn } from "./AddPlaylistFilesToDatabaseBtn";
import { CleanPlaylistBtn } from "./CleanPlaylistBtn";

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