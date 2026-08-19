import { batch, For, Show, Suspense } from "solid-js";
import { state, type PlaylistFile } from "~/state";
import { invoke } from "@tauri-apps/api/core";
import { createAsync, useAction, useBeforeLeave, useNavigate } from "@solidjs/router";
import { addFilesToDatabase, editFilm, deleteFilmsByPaths } from "../api";
import type { TActor } from "~/datatypes";
import { createTempPlaylist } from "~/features/movies/utils/createTempPlaylist";
import { enc } from "~/utils/encodeDecode";
import { CameraIcon, DramaIcon, FilePlayIcon, FilesIcon, ListVideoIcon, PencilIcon, PlayIcon, ScissorsIcon, SearchCodeIcon, TagIcon, Trash2Icon, TrashIcon } from "lucide-solid";
import { confirm, open } from "@tauri-apps/plugin-dialog";
import { rename, writeTextFile } from "@tauri-apps/plugin-fs";
import { BaseDirectory, sep } from "@tauri-apps/api/path";
import { getFilmByPath } from "../api";
import { ContextMenu } from "~/components/context-menu/ContextMenu";

type P = ({
    isMainPanel: true;
    contextMenu: {
        isOpen: boolean;
        x: number;
        y: number;
        close(): void;
        data: {
            title: string;
            path: string;
            filmId?: number
            rowId?: string
        },
    }
} | {
    isMainPanel: false
    contextMenu: {
        isOpen: boolean;
        x: number;
        y: number;
        close(): void;
        data: {
            title: string;
            path: string;
            filmId?: number
            rowId: string
        },
    }
}) & {
    getSelectedFilms: () => PlaylistFile[]
}

export default function MoviesContextMenu(props: P) {
    const data = createAsync(() => getFilmByPath(props.contextMenu.data.path))
    const navigate = useNavigate()
    const addAction = useAction(addFilesToDatabase)
    const actors = () => data() ? JSON.parse(data()!.actors as string) as TActor[] : []
    const tags = () => data() ? JSON.parse(data()!.tags as string) as string[] : []
    const deleteAction = useAction(deleteFilmsByPaths)
    const updateAction = useAction(editFilm)

    useBeforeLeave((e) => {
        e.preventDefault();
        props.contextMenu.close()
        e.retry(true)
    })

    return (
        <Suspense>
            <ContextMenu close={props.contextMenu.close} pos={{ x: props.contextMenu.x, y: props.contextMenu.y }} >
                <ContextMenu.Item
                    onClick={() => {
                        let rowId: string
                        if (props.isMainPanel) {
                            const playlist = props.getSelectedFilms();
                            state.sidePanel.setFiles(playlist)
                            rowId = state.sidePanel.list.find(file => file.path === props.contextMenu.data.path)!.rowId
                        }
                        else
                            rowId = props.contextMenu.data.rowId
                        navigate("/play?rowId=" + rowId)
                    }}
                    icon={<PlayIcon />}
                >
                    Play
                </ContextMenu.Item>
                <Show when={props.isMainPanel}>
                    <ContextMenu.Item
                        onClick={() => {
                            state.sidePanel.push(props.getSelectedFilms())
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
                            await createTempPlaylist(props.getSelectedFilms())
                        }
                        catch (error) {
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
                                <ContextMenu.Link
                                    icon={<TagIcon />}
                                    href={`/movies/tags/${tag}`}
                                >
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
                                <ContextMenu.Link
                                    icon={<DramaIcon />}
                                    href={`/movies/actors/${enc({ display: actor.name, id: actor.actorId })}`}
                                >
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
                            props.contextMenu.close()
                        } catch (error) {
                            console.error(error)
                        }
                    }}
                >
                    Show In Explorer
                </ContextMenu.Item>
                <ContextMenu.Item
                    onClick={() => {
                        batch(() => {
                            props.contextMenu.close()
                            state.dialog.openDialog({type: 'film', data: {filmId: data()!.filmId}})

                        })
                    }}
                    icon={<PencilIcon />}
                >
                    Edit
                </ContextMenu.Item>
                <ContextMenu.Item
                    icon={<SearchCodeIcon />}
                    onClick={async () => {
                        const apiKey = await invoke<string | null>('get_password');
                        if (!apiKey) {
                            return await invoke("show_api_key_window")
                        }
                        props.contextMenu.close()
                        state.dialog.openDialog({
                            type: "tagFilm",
                            data: {
                                ...data()!
                            }
                        })
                    }}
                >
                    Autotag
                </ContextMenu.Item>
                <Show when={actors().length > 0}>
                    <ContextMenu.SubMenu label="Edit Actor" icon={<PencilIcon />}>
                        <For each={actors()}>
                            {actor =>
                                <ContextMenu.Item
                                    icon={<DramaIcon />}
                                    onClick={() => {
                                        state.dialog.openDialog({type: "actor", data: {actorId: actor.actorId}});
                                        props.contextMenu.close()
                                    }}
                                >
                                    {actor.name}
                                </ContextMenu.Item>
                            }
                        </For>
                    </ContextMenu.SubMenu>
                </Show>                
                <ContextMenu.Item
                    icon={<ScissorsIcon />}
                    onClick={async () => {
                        try {
                            const dir = await open({ directory: true })
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
                            props.contextMenu.close()
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
                <ContextMenu.Divider />
                <Show when={props.isMainPanel}>

                    <ContextMenu.Item
                        class="danger"
                        icon={<TrashIcon />}
                        onClick={async () => {
                            const selections = props.getSelectedFilms();
                            if (selections.length === 0) return
                            const confirmed = await confirm(`Permanently delete ${selections.length} film${selections.length != 1 ? "s" : ""} from the database?`, { kind: "warning" });
                            if (!confirmed) return;
                            await deleteAction(selections.map(film => film.path))
                            props.contextMenu.close()
                        }}
                    >
                        Remove From Database
                    </ContextMenu.Item>
                </Show>
                <ContextMenu.Item
                    icon={<Trash2Icon />}
                    class="danger"
                    onClick={async () => {
                        try {
                            const selections = props.getSelectedFilms()
                            if (selections.length == 0) return;
                            const accepted = await confirm(`Move ${selections.length} item to Recycle Bin?`, { title: "Recycle", kind: "warning" })
                            if (!accepted) return;
                            const paths: string[] = await invoke("recycle", {
                                paths: selections.map(item => item.path),
                            })
                            if (paths.length != selections.length)
                                state.status.setStatus("Some items could not be moved to Recycle Bin")
                            await deleteAction(paths)
                            props.contextMenu.close()
                        }
                        catch (error: any) {
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
