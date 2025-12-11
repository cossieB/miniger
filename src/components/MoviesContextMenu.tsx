import { createUniqueId, For, Show, Suspense } from "solid-js";
import { state } from "../state";
import { ContextMenu } from "./ContextMenu/ContextMenu";
import { invoke } from "@tauri-apps/api/core";
import { createAsync, useAction, useNavigate } from "@solidjs/router";
import { addDirectoriesToDatabase } from "~/api/mutations";
import { getFilmByPath } from "~/api/data";
import type { TActor } from "~/datatypes";
import { CameraSvg, CurvedArrowSvg, PlayCircleSvg, PlayFillSvg, PlayListSvg, PlaySvg, TagSvg, TheatreSvg, WindowSvg } from "~/icons";
import { createTempPlaylist } from "~/utils/createTempPlaylist";
import { unwrap } from "solid-js/store";
import { enc } from "~/utils/encodeDecode";

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
    const actors = () => data() ? JSON.parse(data()!.actors) as TActor[] : []
    const tags = () => data() ? JSON.parse(data()!.tags) as string[] : []

    const selections = unwrap(props.contextMenu.selections)

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
                    onClick={() => state.miniplayer.setVideo({ path: props.contextMenu.data.path, title: props.contextMenu.data.title })}>
                    Play In Miniplayer
                </ContextMenu.Item>
                <ContextMenu.Item
                    onClick={async () => {
                        try {
                            await createTempPlaylist(selections)
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
                                <ContextMenu.Link href={`/movies/actors/${enc({display:actor.name, id:actor.actorId})}`}>
                                    {actor.name}
                                </ContextMenu.Link>
                            }
                        </For>
                    </ContextMenu.SubMenu>
                </Show>
                <Show when={data()?.studioId}>
                    <ContextMenu.Link
                        href={`/movies/studios/${enc({display:data()!.studioName!, id: data()!.studioId!})}`}
                        icon={<CameraSvg />}
                    >

                        More From {data()?.studioName}
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
                <Show when={actors().length > 0}>
                    <ContextMenu.SubMenu label="Goto Actor" icon={<CurvedArrowSvg />}>
                    <For each={actors()}>
                        {actor =>
                            <ContextMenu.Link href={`/actors?gridId=${actor.actorId}`}>
                                {actor.name}
                            </ContextMenu.Link>
                        }
                    </For>
                    </ContextMenu.SubMenu>
                </Show>
            </ContextMenu>
        </Suspense>
    )
}
