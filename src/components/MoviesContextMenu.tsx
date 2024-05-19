import { For, Show } from "solid-js";
import { state } from "../state";
import { ContextMenu } from "./ContextMenu";
import { Actor } from "../datatypes";
import { open, } from "@tauri-apps/plugin-shell";
import { invoke } from "@tauri-apps/api/core";

type P = {
    contextMenu: {
        isOpen: boolean;
        x: number;
        y: number;
        close(): void;
        data: {
            actors: Actor[];
            film_id: number;
            path: string;
            title: string;
            studio_id: number | null;
            release_date: string | null;
            studio_name: string | null;
            tags: string | null;
        };
    }
}

export default function MoviesContextMenu(props: P) {
    return (
        <ContextMenu close={props.contextMenu.close} pos={{ x: props.contextMenu.x, y: props.contextMenu.y }} >
            <ContextMenu.Item
                onClick={() => {
                    state.sidePanel.push([{
                        path: props.contextMenu.data.path,
                        title: props.contextMenu.data.title
                    }])
                }}
            >
                Add To Playlist
            </ContextMenu.Item>
            <Show when={(props.contextMenu.data.tags?.split(", ").length ?? 0) > 0}>
                <ContextMenu.SubMenu label="More From Genre" >
                    <For each={props.contextMenu.data.tags?.split(", ")}>
                        {tag =>
                            <ContextMenu.Link href={`/movies/tags/${tag}`}>
                                {tag}
                            </ContextMenu.Link>
                        }
                    </For>
                </ContextMenu.SubMenu>
            </Show>
            <Show when={props.contextMenu.data.actors.length > 0}>
                <ContextMenu.SubMenu label="More From Actor" >
                    <For each={props.contextMenu.data.actors}>
                        {actor =>
                            <ContextMenu.Link href={`/movies/actors/${actor.actor_id}`}>
                                {actor.name}
                            </ContextMenu.Link>
                        }
                    </For>
                </ContextMenu.SubMenu>
            </Show>
            <ContextMenu.Item
                onClick={() => open(props.contextMenu.data.path)} >
                Open With Default Player
            </ContextMenu.Item>
            <ContextMenu.Item
                onClick={async () => {
                    try {
                        await invoke("open_explorer", {
                            path: props.contextMenu.data.path,
                        })      
                    } catch (error) {
                        console.error(error)
                    }
                }}
            >
                Show In Explorer
            </ContextMenu.Item>
        </ContextMenu>

    )
}