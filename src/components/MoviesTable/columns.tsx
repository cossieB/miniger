import { For, Show } from "solid-js";
import { TABLE_CELL_HEIGHT } from "~/constants";
import type { MovieData } from "~/types";
import { secondsToTime } from "~/utils/conversions";
import { createAppColumnHelper } from "~/utils/createTable";

const columnHelper = createAppColumnHelper<MovieData[number]>();
export const columns = columnHelper.columns([
    columnHelper.accessor("title", {
        header: "Title",
        size: 400,
        sortFn: "text",
        cell: (info) => (
            <div
                class="flex flex-col px-2 justify-center overflow-hidden "
                style={{
                    width: info.column.getSize() + "px"
                }}
            >
                <span class="font-medium text-zinc-100 truncate text-ellipsis">
                    {info.getValue()}
                </span>
                <span class="text-xs text-zinc-500 truncate ">
                    {info.row.original.path}
                </span>
            </div>
        ),
    }),
    columnHelper.accessor("studioName", {
        header: "Studio",
        size: 150,
        sortFn: "text",
        cell: (info) => (
            <div
                class="text-zinc-400 px-2"
                style={{
                    width: info.column.getSize() + "px"
                }}
            >
                {info.getValue() ?? "—"}
            </div>
        ),
    }),
    columnHelper.accessor("actors", {
        header: "Cast",
        enableSorting: false,
        cell: (info) => {
            const actors = info.row.original.actors;
            return (
                <div class="flex flex-wrap gap-1 items-center"
                    style={{
                        width: info.column.getSize() + "px",
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
        enableSorting: false,
        cell: (info) => {
            const tags = info.getValue();
            return (
                <div
                    class="flex flex-wrap items-center"
                    style={{
                        width: info.column.getSize() + "px",
                        height: TABLE_CELL_HEIGHT + "px"
                    }}
                >
                    <Show
                        when={tags.length > 0}
                        fallback={<span class="text-zinc-600">—</span>}
                    >
                        <For each={tags}>
                            {(tag) => (
                                <span class="rounded border border-amber-500/30 px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-amber-400/90 grow-0 h-min">
                                    {tag}
                                </span>
                            )}
                        </For>
                    </Show>
                </div>
            );
        },
    }),
    columnHelper.accessor("releaseDate", {
        header: "Released",
        size: 100,
        sortFn: "text",
        cell: (info) => (
            <div
                class="font-mono text-sm text-zinc-400"
                style={{
                    width: info.column.getSize() + "px",

                }}
            >
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor("dateAdded", {
        header: "Added",
        size: 175,
        sortFn: "datetime",
        cell: (info) => (
            <div
                class="font-mono text-sm text-zinc-500"
                style={{
                    width: info.column.getSize() + "px",

                }}
            >
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor(row => Number(row.metadata?.format.duration) || null, {
        header: "Duration",
        id: "duration",
        sortFn: 'basic',
        size: 50,
        cell: info => {
            const dur = info.getValue()
            return (
                <div class="text-right px-2">
                    {dur && secondsToTime(dur)}
                </div>
            )
        }
    }),
    columnHelper.accessor(row => Number(row.metadata?.format.size) || null, {
        header: "Size",
        id: "size",
        size: 100,
        cell: info => {
            const size = info.getValue()
            const display = size ? new Intl.NumberFormat(undefined, { useGrouping: true }).format(size) : null
            return (
                <div class="text-right px-2">
                    {display}
                </div>
            )
        }
    }),
    columnHelper.accessor("metadata.format.bit_rate", {
        header: "Bit Rate",
        id: "bitrate",
        size: 100,
        cell: info => {
            const size = info.getValue()
            const display = size ? new Intl.NumberFormat(undefined, { useGrouping: true }).format(Number(size)) : null
            return (
                <div class="text-right px-2">
                    {display}
                </div>
            )
        }
    }),
    columnHelper.accessor(row => row.metadata?.streams?.find(x => x.codec_type == 'video')?.codec_name, {
        header: "Format",
        id: "format",
        size: 50,
        cell: info => <div class="text-center"> {info.getValue()} </div>
    }),
    columnHelper.accessor("metadata.streams", {
        header: "Resolution",
        size: 50,
        enableSorting: false,
        cell: info => {
            const videoStream = info.getValue()?.find(x => x.codec_type == "video")
            return (
                <div class="text-center">
                    {!videoStream ? null : `${videoStream.width}x${videoStream.height}`}
                </div>
            )
        }
    })
])