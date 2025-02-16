import { For, Show } from "solid-js";
import { state } from "../state";
import { ContextMenu } from "./ContextMenu/ContextMenu";
import { Actor } from "../datatypes";
import { open, } from "@tauri-apps/plugin-shell";
import { invoke } from "@tauri-apps/api/core";
import { useAction, useNavigate } from "@solidjs/router";
import { addDirectoriesToDatabase } from "~/api/mutations";

type P = {
    contextMenu: {
        isOpen: boolean;
        x: number;
        y: number;
        close(): void;
        data: {
            actors: Actor[];
            path: string;
            title: string;
            studio_id: number | null;
            release_date: string | null;
            studio_name: string | null;
            tags: string[];
            rowId: string;
            isOnDb: boolean;
        },
        selections: P['contextMenu']['data'][]
    }
}

export default function MoviesContextMenu(props: P) {
    const navigate = useNavigate()
    return (
        <ContextMenu close={props.contextMenu.close} pos={{ x: props.contextMenu.x, y: props.contextMenu.y }} >
            <ContextMenu.Item
                onClick={() => {
                    state.sidePanel.setFiles(props.contextMenu.selections)
                    navigate("/play?rowId=" + props.contextMenu.data.rowId)
                }}
            >
                Play
            </ContextMenu.Item>
            <ContextMenu.Item
                onClick={() => {
                    state.sidePanel.push(props.contextMenu.selections)
                }}
            >
                Add To Playlist
            </ContextMenu.Item>
            <MoviesMenu data={props.contextMenu.data} />
        </ContextMenu>
    )
}

export function MoviesMenu(props: Pick<P['contextMenu'], 'data'>) {
    const addAction = useAction(addDirectoriesToDatabase)
    return (
        <>
            <Show when={!props.data.isOnDb}>
                <ContextMenu.Item onClick={async () => {
                    await addAction([props.data])
                    state.sidePanel.setIsOnDb(props.data.rowId)
                }} >
                    Add To Database
                </ContextMenu.Item>
            </Show>
            <ContextMenu.Item onClick={() => state.setMiniplayer({ path: props.data.path, title: props.data.title })}>
                Play In Miniplayer
            </ContextMenu.Item>
            <Show when={props.data.tags.length > 0}>
                <ContextMenu.SubMenu label="More From Genre" >
                    <For each={props.data.tags}>
                        {tag =>
                            <ContextMenu.Link href={`/movies/tags/${tag}`}>
                                {tag}
                            </ContextMenu.Link>
                        }
                    </For>
                </ContextMenu.SubMenu>
            </Show>
            <Show when={props.data.actors.length > 0}>
                <ContextMenu.SubMenu label="More From Actor" >
                    <For each={props.data.actors}>
                        {actor =>
                            <ContextMenu.Link href={`/movies/actors/${actor.actor_id}`}>
                                {actor.name}
                            </ContextMenu.Link>
                        }
                    </For>
                </ContextMenu.SubMenu>
            </Show>
            <Show when={props.data.studio_id}>
                <ContextMenu.Link href={`/movies/studios/${props.data.studio_id}`}>
                    More From {props.data.studio_name}
                </ContextMenu.Link>
            </Show>
            <ContextMenu.Item
                onClick={async () => {
                    try {
                        await open(props.data.path)
                    } catch (error) {
                        console.error(error)
                        state.status.setStatus("File Not Found")
                    }
                }} >
                Open With Default Player
            </ContextMenu.Item>
            <ContextMenu.Item
                onClick={async () => {
                    try {
                        await invoke("open_explorer", {
                            path: props.data.path,
                        })
                    } catch (error) {
                        console.error(error)
                    }
                }}
            >
                Show In Explorer
            </ContextMenu.Item>
        </>
    )
}