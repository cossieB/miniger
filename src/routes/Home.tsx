import { type JSXElement } from "solid-js";
import { useAction } from "@solidjs/router";
import { addFilesToDatabase } from "~/api/mutations";
import { addFolderToSidebar, readDirectories } from "~/utils/readDirectories";
import { loadPlaylist, loadVideos } from "~/utils/loadPlaylist";
import { Film, FolderInput, FolderOpen, ListVideo } from "lucide-solid";
import styles from "./pages.module.css"

export function Home() {
    const addAction = useAction(addFilesToDatabase)
    return (
        <div class={styles.home}>
            <h1 >Welcome To Miniger!</h1>
            <div>
                <Btn
                    icon={<FolderOpen  size={50} />}
                    label="Add folder to your sidebar playlist"
                    onclick={addFolderToSidebar}
                />
                <Btn icon={<FolderInput  size={50} />}
                    label="Add folder to your database"
                    onclick={async () => {
                        const files = await readDirectories()
                        files && addAction(files)
                    }}
                />
                <Btn
                    icon={<ListVideo size={50} />}
                    label="Load Playlist File"
                    onclick={loadPlaylist}
                />
                <Btn
                    icon={<Film size={50} />}
                    label="Load Videos"
                    onclick={loadVideos}
                />
            </div>
        </div>
    )
}

type P = {
    label: string;
    icon: JSXElement;
    onclick: () => void;
}

function Btn(props: P) {
    return (
        <button
            class={styles.homeBtn}
            onclick={props.onclick}
        >
            <div>
                {props.icon}
            </div>
            <label> {props.label} </label>
        </button>
    )
}

