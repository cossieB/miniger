import { For, Show } from "solid-js";
import { getStudios, getTags } from "~/api/data";
import { TABLE_CELL_HEIGHT } from "~/constants";
import type { Studio } from "~/kysely/schema";
import type { MovieData } from "~/types";
import { secondsToTime } from "~/utils/conversions";
import { createAppColumnHelper } from "~/utils/createTable";
import { TagsCell } from "./TagsCell";

const columnHelper = createAppColumnHelper<MovieData[number]>();

export const columns = columnHelper.columns([
    columnHelper.accessor("title", {
        header: "Title",
        size: 400,
        sortFn: "text",
        cell: props => (
            <props.cell.TextCell
                onUpdate={async val => {
                    props.table.options.meta!.updateFilm({
                        title: val,
                        filmId: props.row.original.filmId
                    })
                }}
            />
        )
    }),
    columnHelper.accessor("studioName", {
        header: "Studio",
        size: 100,
        sortFn: "text",
        cell: (props) => (
            <props.cell.AsyncSelectCell
                getOptions={getStudios}
                initialValue={props.row.original.studioId ?? undefined}
                onUpdate={async val => {
                    const newStudioId = Number(val) || null
                    await props.table.options.meta!.updateFilm({
                        studioId: newStudioId,
                        filmId: props.row.original.filmId
                    });
                }}
                //@ts-expect-error
                normalize={(studio: Studio) => ({
                    label: studio.name,
                    value: studio.studioId
                })}
            />
        ),
    }),
    columnHelper.accessor("actors", {
        header: "Cast",
        enableSorting: false,
        cell: (props) => {
            const actors = props.row.original.actors;
            return (
                <div
                    class="flex flex-wrap gap-1 items-center overflow-hidden"

                    onDblClick={e => {
                        e.preventDefault();
                    }}
                    style={{
                        width: props.column.getSize() + "px",
                        height: TABLE_CELL_HEIGHT + "px"
                    }}
                >
                    <For each={actors.slice(0, 3)}>
                        {(actor) => (
                            <span class="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 grow-0 h-min">
                                {actor.name}
                            </span>
                        )}
                    </For>
                    <Show when={actors.length > 3}>
                        <span class="rounded-full bg-zinc-800/60 px-2 py-0.5 text-xs text-zinc-500">
                            +{actors.length - 3}
                        </span>
                    </Show>
                </div>
            );
        },
    }),
    columnHelper.accessor("tags", {
        header: "Tags",
        size: 175,
        enableSorting: false,
        cell: (props) => {

            return (
                <TagsCell onUpdate={async tags => {
                    props.table.options.meta?.updateFilm({
                        filmId: props.cell.row.original.filmId,
                        tags
                    }, [getTags.key])
                }} />
                // <div
                //     class="flex flex-wrap items-center overflow-hidden"
                //     style={{
                //         width: props.column.getSize() + "px",
                //         height: TABLE_CELL_HEIGHT + "px"
                //     }}
                // >
                //     <For each={tags.slice(0, 3)}>
                //         {(tag) => (
                //             <span class="rounded border border-amber-500/30 px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-amber-400/90 grow-0 h-min">
                //                 {tag}
                //             </span>
                //         )}
                //     </For>
                //     <Show when={tags.length > 3}>
                //         <span class="rounded border border-amber-500/30 px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-amber-400/90 grow-0 h-min">
                //             +{tags.length - 3}
                //         </span>
                //     </Show>
                // </div>
            );
        },
    }),
    columnHelper.accessor("releaseDate", {
        header: "Released",
        size: 100,
        sortFn: "text",
        cell: (props) => (
            <props.cell.TextCell
                type="date"
                onUpdate={async val => {                    
                    await props.table.options.meta!.updateFilm({
                        releaseDate: val || null,
                        filmId: props.row.original.filmId
                    })
                }}
            />
        ),
    }),
    columnHelper.accessor(row => Number(row.metadata?.format.duration) || null, {
        header: "Length",
        id: "duration",
        sortFn: 'basic',
        size: 75,
        cell: props => {
            const dur = props.getValue()
            return <props.cell.LockedCell class="text-right" value={dur ? secondsToTime(dur) : null} />
        }
    }),
    columnHelper.accessor(row => Number(row.metadata?.format.size) || null, {
        header: "Size",
        id: "size",
        size: 100,
        cell: props => {
            const size = props.getValue()
            const display = size ? new Intl.NumberFormat(undefined, { useGrouping: true }).format(size) : null
            return <props.cell.LockedCell class="text-right" value={display} />
        }
    }),
    columnHelper.accessor("metadata.format.bit_rate", {
        header: "Bit Rate",
        id: "bitrate",
        size: 100,
        cell: props => {
            const size = props.getValue()
            const display = size ? new Intl.NumberFormat(undefined, { useGrouping: true }).format(Number(size)) : null
            return (
                <props.cell.LockedCell
                    class="text-right px-2 truncate"
                    value={display}
                />
            )
        }
    }),
    columnHelper.accessor(row => row.metadata?.streams?.find(x => x.codec_type == 'video')?.codec_name, {
        header: "Format",
        id: "format",
        size: 100,
        cell: props => <props.cell.LockedCell class="text-center" />
    }),
    columnHelper.accessor(row => {
        const videoStream = row.metadata?.streams?.find(x => x.codec_type == "video")
        return !videoStream ? null : `${videoStream.width}x${videoStream.height}`
    }, {
        header: "Resolution",
        id: "resolution",
        size: 100,
        enableSorting: false,
        cell: props => <props.cell.LockedCell class="text-center" />
    }),
    columnHelper.accessor("dateAdded", {
        header: "Added",
        size: 175,
        sortFn: "datetime",
        cell: (props) => <props.cell.LockedCell />,
    }),
    columnHelper.accessor("path", {
        cell: props => <props.cell.LockedCell />
    })
])