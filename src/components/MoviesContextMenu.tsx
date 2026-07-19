import { createUniqueId, For, Show, Suspense } from "solid-js";
import { state } from "../state";
import { ContextMenu } from "./ContextMenu/ContextMenu";
import { invoke } from "@tauri-apps/api/core";
import { createAsync, useAction, useNavigate } from "@solidjs/router";
import { addFilesToDatabase, editFilm, removeByPaths } from "~/api/mutations";
import { getFilmByPath } from "~/api/data";
import type { TActor } from "~/datatypes";
import { createTempPlaylist } from "~/utils/createTempPlaylist";
import { unwrap } from "solid-js/store";
import { enc } from "~/utils/encodeDecode";
import { CameraIcon, CornerRightUpIcon, DramaIcon, FilePlayIcon, FilesIcon, ListVideoIcon, PlayIcon, ScissorsIcon, TagIcon, Trash2Icon } from "lucide-solid";
import { confirm, open } from "@tauri-apps/plugin-dialog";
import { rename, writeTextFile } from "@tauri-apps/plugin-fs";
import { BaseDirectory, sep } from "@tauri-apps/api/path";

type F = {
    title: string;
    path: string;
    filmId?: number
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
    const addAction = useAction(addFilesToDatabase)
    const actors = () => data() ? JSON.parse(data()!.actors as string) as TActor[] : []
    const tags = () => data() ? JSON.parse(data()!.tags as string) as string[] : []
    const deleteAction = useAction(removeByPaths)
    const updateAction = useAction(editFilm)

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
                    icon={<PlayIcon />}
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
                        icon={<ListVideoIcon />}
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
                    icon={<PlayIcon />}
                    onClick={() => state.miniplayer.setVideo({ path: props.contextMenu.data.path, title: props.contextMenu.data.title })}
                >
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
                    icon={<FilePlayIcon />}
                >
                    Open With Default Player
                </ContextMenu.Item>
                <Show when={tags().length > 0}>
                    <ContextMenu.SubMenu label="More From Genre" icon={<TagIcon />} >
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
                    <ContextMenu.SubMenu label="More From Actor" icon={<DramaIcon />} >
                        <For each={actors()}>
                            {actor =>
                                <ContextMenu.Link href={`/movies/actors/${enc({ display: actor.name, id: actor.actorId })}`}>
                                    {actor.name}
                                </ContextMenu.Link>
                            }
                        </For>
                    </ContextMenu.SubMenu>
                </Show>
                <Show when={data()?.studioId}>
                    <ContextMenu.Link
                        href={`/movies/studios/${enc({ display: data()!.studioName!, id: data()!.studioId! })}`}
                        icon={<CameraIcon />}
                    >

                        More From {data()?.studioName}
                    </ContextMenu.Link>
                </Show>
                <ContextMenu.Item
                    icon={<FilesIcon />}
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
                    <ContextMenu.SubMenu label="Goto Actor" icon={<CornerRightUpIcon />}>
                        <For each={actors()}>
                            {actor =>
                                <ContextMenu.Link href={`/actors?gridId=${actor.actorId}`}>
                                    {actor.name}
                                </ContextMenu.Link>
                            }
                        </For>
                    </ContextMenu.SubMenu>
                </Show>
                <ContextMenu.Item
                    icon={<ScissorsIcon />}
                    onClick={async () => {
                        try {
                            const dir = await open({directory: true})
                            if (!dir) return;  
                            const oldPath = props.contextMenu.data.path
                            const segment = oldPath.slice(oldPath.lastIndexOf(sep()) + 1)
                            const newPath = dir + sep() + segment;
                            if (oldPath == newPath) return;
                            await rename(oldPath, newPath)
                            if (!props.contextMenu.data.filmId) return;

                            await updateAction({
                                filmId: props.contextMenu.data.filmId,
                                path: newPath
                            })
                        } 
                        catch (error) {
                            state.status.setStatus(String(error))
                            writeTextFile("logs.txt", String(error), {
                                append: true,
                                baseDir: BaseDirectory.AppData
                            })
                        }
                    }}
                >
                    Move
                </ContextMenu.Item>
                <ContextMenu.Item
                    icon={<Trash2Icon />}  
                    onClick={async () => {
                        try {
                            if (selections.length == 0) return;
                            const accepted = await confirm(`Move ${selections.length} item to Recycle Bin?`, {title: "Recycle", kind: "warning"})
                            if (!accepted) return;
                            const paths: string[] = await invoke("recycle", {
                                paths: selections.map(item => item.path),
                            })
                            if (paths.length != selections.length)
                                state.status.setStatus("Some items could not be moved to Recycle Bin")
                            await deleteAction(paths)
                        } catch (error: any) {
                            state.status.setStatus(error.message)
                        }
                    }}                  
                >
                    Move to Trash
                </ContextMenu.Item>
            </ContextMenu>
        </Suspense>
    )
}
