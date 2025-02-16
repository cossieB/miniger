import { JSXElement } from "solid-js";
import { useAction } from "@solidjs/router";
import { addDirectoriesToDatabase } from "~/api/mutations";
import { addFolderToSidebar, readDirectories } from "~/utils/readDirectories";
import { AddFolderSvg, FilmstripSvg, OpenFolderSvg, PlayListSvg } from "../icons";
import { loadPlaylist, loadVideos } from "~/utils/loadPlaylist";

export function Home() {
    const addAction = useAction(addDirectoriesToDatabase)
    return (
        <div class="mx-1">
            <h1 class="text-center text-2xl my-2.5">Welcome To Miniger!</h1>
            <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2">
                <Btn
                    icon={<OpenFolderSvg fill={undefined} />}
                    label="Add folder to your sidebar playlist"
                    onclick={addFolderToSidebar}
                />
                <Btn icon={<AddFolderSvg fill={undefined} />}
                    label="Add folder to your database"
                    onclick={async () => {
                        const files = await readDirectories()
                        files && addAction(files)
                    }}
                />
                <Btn
                    icon={<PlayListSvg />}
                    label="Load Playlist File"
                    onclick={loadPlaylist}
                />
                <Btn
                    icon={<FilmstripSvg />}
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
            class="p-1 h-52 flex flex-col items-center border-2 border-amber-400 hover:bg-slate-700 cursor-pointer hover:bg-gradient-to-b from-slate-700 to-slate-900 homeBtn"
            onclick={props.onclick}
        >
            <div class="h-[80%] flex place-items-center">
                {props.icon}
            </div>
            <label class="w-full grow "> {props.label} </label>
        </button>
    )
}

