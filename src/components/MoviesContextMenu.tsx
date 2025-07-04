import { createUniqueId, For, Show, Suspense } from "solid-js";
import { state } from "../state";
import { ContextMenu } from "./ContextMenu/ContextMenu";
import { open, } from "@tauri-apps/plugin-shell";
import { invoke } from "@tauri-apps/api/core";
import { createAsync, useAction, useNavigate } from "@solidjs/router";
import { addDirectoriesToDatabase } from "~/api/mutations";
import { getFilmByPath } from "~/api/data";
import { Actor } from "~/datatypes";
import { CameraSvg, PlayCircleSvg, PlayFillSvg, PlayListSvg, PlaySvg, TagSvg, TheatreSvg, WindowSvg } from "~/icons";

type F = {
    title: string;
    path: string;
}

type P = {
    isMainPanel: boolean;
    contextMenu: {
        isOpen: boolean;
        x: number;
        y: number;
        close(): void;
        data: F,
        selections: P['contextMenu']['data'][]
    }
}

export default function MoviesContextMenu(props: P) {
    const data = createAsync(() => getFilmByPath(props.contextMenu.data.path))
    const navigate = useNavigate()
    const addAction = useAction(addDirectoriesToDatabase)
    const actors = () => data() ? JSON.parse(data()!.actors) as Actor[] : []
    const tags = () => data() ? JSON.parse(data()!.tags) as string[] : []
    return (
        <Suspense>
            <ContextMenu close={props.contextMenu.close} pos={{ x: props.contextMenu.x, y: props.contextMenu.y }} >
                <ContextMenu.Item
                    onClick={() => {
                        const playlist = props.contextMenu.selections.map(file => ({
                            ...file,
                            rowId: createUniqueId(),
                            isSelected: false,
                            selectedLast: false,
                            lastDraggedOver: false
                        }))
                        state.sidePanel.setFiles(playlist)
                        const rowId = playlist.find(file => file.path === props.contextMenu.data.path)!.rowId
                        navigate("/play?rowId=" + rowId)
                    }}
                    icon={<PlaySvg />}
                >
                    Play
                </ContextMenu.Item>
                <Show when={props.isMainPanel}>
                    <ContextMenu.Item
                        onClick={() => {
                            const playlist = props.contextMenu.selections.map(file => ({
                                ...file,
                                rowId: createUniqueId(),
                                isSelected: false,
                                selectedLast: false,
                                lastDraggedOver: false
                            }))
                            state.sidePanel.push(playlist)
                        }}
                        icon={<PlayListSvg />}
                    >
                        Add To Playlist
                    </ContextMenu.Item>
                </Show>
                <Show when={data() === null}>
                    <ContextMenu.Item onClick={async () => {
                        await addAction([props.contextMenu.data])
                    }} >
                        Add To Database
                    </ContextMenu.Item>
                </Show>
                <ContextMenu.Item
                    icon={<PlayFillSvg />}
                    onClick={() => state.setMiniplayer({ path: props.contextMenu.data.path, title: props.contextMenu.data.title })}>
                    Play In Miniplayer
                </ContextMenu.Item>
                <ContextMenu.Item
                    onClick={async () => {
                        try {
                            await open(props.contextMenu.data.path)
                        } catch (error) {
                            console.error(error)
                            state.status.setStatus("File Not Found")
                        }
                    }} 
                    icon={<PlayCircleSvg />}
                    >
                    Open With Default Player
                </ContextMenu.Item>
                <Show when={tags().length > 0}>
                    <ContextMenu.SubMenu label="More From Genre" icon={<TagSvg />} >
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
                    <ContextMenu.SubMenu label="More From Actor" icon={<TheatreSvg width={16} />} >
                        <For each={actors()}>
                            {actor =>
                                <ContextMenu.Link href={`/movies/actors/${actor.actor_id}?${actor.actor_id}=${actor.name}`}>
                                    {actor.name}
                                </ContextMenu.Link>
                            }
                        </For>
                    </ContextMenu.SubMenu>
                </Show>
                <Show when={data()?.studio_id}>
                    <ContextMenu.Link
                        href={`/movies/studios/${data()?.studio_id}?${data()?.studio_id}=${data()?.studio_name}`}
                        icon={<CameraSvg />}
                    >

                        More From {data()?.studio_name}
                    </ContextMenu.Link>
                </Show>
                <ContextMenu.Item
                    icon={<WindowSvg />}
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
        </Suspense>
    )
}
