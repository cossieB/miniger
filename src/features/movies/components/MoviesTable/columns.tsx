import { ActorsCell } from "~/components/tables/ActorsCell";
import { TagsCell } from "~/components/tables/TagsCell";
import { getStudios } from "~/features/studios/api";
import { getTags } from "~/features/tags/api";
import type { Studio } from "~/kysely/schema";
import type { MovieData } from "~/types";
import { secondsToTime } from "~/utils/conversions";
import { createAppColumnHelper } from "~/utils/createTable";

const columnHelper = createAppColumnHelper<MovieData[number]>();

export const columns = columnHelper.columns([
    columnHelper.accessor("title", {
        header: "Title",
        size: 400,
        sortFn: "text",
        cell: props => (
            <props.cell.TextCell
                onUpdate={async val => {
                    props.table.options.meta!.updateFilm!({
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
                    await props.table.options.meta!.updateFilm!({
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
        cell: (props) => (
            <ActorsCell
                onUpdate={async actors => {
                    await props.table.options.meta!.updateFilm!({
                        actorIds: actors.map(actor => actor.actorId),
                        filmId: props.row.original.filmId
                    })
                }}
            />
        )
    }),
    columnHelper.accessor("tags", {
        header: "Tags",
        size: 175,
        enableSorting: false,
        cell: (props) => {

            return (
                <TagsCell onUpdate={async tags => {
                    props.table.options.meta?.updateFilm!({
                        filmId: props.cell.row.original.filmId,
                        tags
                    }, [getTags.key])
                }} />
            );
        },
    }),
    columnHelper.accessor("releaseDate", {
        header: "Released",
        size: 150,
        sortFn: "text",
        cell: (props) => (
            <props.cell.TextCell
                type="date"
                onUpdate={async val => {
                    await props.table.options.meta!.updateFilm!({
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
            return <props.cell.LockedCell
                style={{
                    "text-align": "right"
                }} value={dur ? secondsToTime(dur) : null} />
        }
    }),
    columnHelper.accessor(row => Number(row.metadata?.format.size) || null, {
        header: "Size",
        id: "size",
        size: 100,
        cell: props => {
            const size = props.getValue()
            const display = size ? new Intl.NumberFormat(undefined, { useGrouping: true }).format(size) : null
            return <props.cell.LockedCell
                style={{
                    "text-align": "right"
                }} value={display} />
        }
    }),
    columnHelper.accessor(row => row.metadata?.format.bit_rate ?? null, {
        header: "Bit Rate",
        id: "bitrate",
        size: 100,
        cell: props => {
            const size = props.getValue()
            const display = size ? new Intl.NumberFormat(undefined, { useGrouping: true }).format(Number(size)) : null
            return (
                <props.cell.LockedCell
                    style={{
                        "text-align": "right",
                        "padding-block": "0.75"
                    }}
                    class="text-right px-2 truncate"
                    value={display}
                />
            )
        }
    }),
    columnHelper.accessor(row => row.metadata?.streams?.find(x => x.codec_type == 'video')?.codec_name ?? null, {
        header: "Format",
        id: "format",
        size: 100,
        cell: props => <props.cell.LockedCell style={{"text-align": "center"}}/>
    }),
    columnHelper.accessor(row => {
        const videoStream = row.metadata?.streams?.find(x => x.codec_type == "video")
        return !videoStream ? null : `${videoStream.width}x${videoStream.height}`
    }, {
        header: "Resolution",
        id: "resolution",
        size: 100,
        enableSorting: false,
        cell: props => <props.cell.LockedCell style={{"text-align": "center"}}/>
    }),
    columnHelper.accessor("dateAdded", {
        header: "Added",
        size: 175,
        sortFn: "datetime",
        cell: (props) => <props.cell.LockedCell style={{"text-align": "end"}} />,
    }),
    columnHelper.accessor("path", {
        cell: props => <props.cell.LockedCell />
    })
])