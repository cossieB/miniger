import { For, Show } from "solid-js";
import { state } from "../state";
import { ContextMenu } from "./ContextMenu/ContextMenu";
import { Actor } from "../datatypes";
import { open, } from "@tauri-apps/plugin-shell";
import { invoke } from "@tauri-apps/api/core";
import { unwrap } from "solid-js/store";

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
        },
        selections: P['contextMenu']['data'][]
    }
}

export default function MoviesContextMenu(props: P) {
    return (
        <ContextMenu close={props.contextMenu.close} pos={{ x: props.contextMenu.x, y: props.contextMenu.y }} >
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
    const tags = () => unwrap(props.data).tags;
    const actors = () => unwrap(props.data).actors
    const studio = () => ({
        name: unwrap(props.data).studio_name,
        id: unwrap(props.data).studio_id,
    })
    return (
        <>
            <Show when={tags().length > 0}>
                <ContextMenu.SubMenu label="More From Genre" >
                    <For each={tags()}>
                        {tag =>
                            <ContextMenu.Link href={`/movies/tags/${tag}`}>
                                {tag}
                            </ContextMenu.Link>
                        }
                    </For>
                </ContextMenu.SubMenu>
            </Show>
            <Show when={actors().length > 0}>
                <ContextMenu.SubMenu label="More From Actor" >
                    <For each={actors()}>
                        {actor =>
                            <ContextMenu.Link href={`/movies/actors/${actor.actor_id}`}>
                                {actor.name}
                            </ContextMenu.Link>
                        }
                    </For>
                </ContextMenu.SubMenu>
            </Show>
            <Show when={studio().id}>
                <ContextMenu.Link href={`/movies/studios/${studio().id}`}>
                    More From {studio().name}
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