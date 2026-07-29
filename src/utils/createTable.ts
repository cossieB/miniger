import { tableFeatures, columnSizingFeature, rowSortingFeature, columnResizingFeature, createSortedRowModel, sortFn_alphanumeric, sortFn_datetime, sortFn_text, sortFn_basic, createTableHook, rowSelectionFeature, metaHelper } from "@tanstack/solid-table"
import { LockedCell, TextCell } from "~/components/table-wrapper/Cells"
import { AsyncSelectCell, SelectCell } from "~/components/table-wrapper/SelectCell"
import type { TFilm } from "~/datatypes"

const features = tableFeatures({
    columnSizingFeature,
    rowSortingFeature,
    columnResizingFeature,
    rowSelectionFeature,
    sortedRowModel: createSortedRowModel(),
    sortFns: {
        alphanumeric: sortFn_alphanumeric,
        datetime: sortFn_datetime,
        text: sortFn_text,
        basic: sortFn_basic
    },
    tableMeta: metaHelper<MovieMeta>()
})

export const {
    createAppTable,
    createAppColumnHelper,
    useCellContext,
    useHeaderContext,
    useTableContext
} = createTableHook({
    features,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    enableRowSelection: true,
    cellComponents: {
        TextCell,
        LockedCell,
        SelectCell,
        AsyncSelectCell
    }
})

export type AppTableFeatures = typeof features

type MovieMeta = {
    updateFilm: (f: Partial<Omit<TFilm, "filmId">> & {
        actorIds?: number[];
        tags?: string[];
    } & {
        filmId: number;
    }, revalidate?: string[] | undefined) => Promise<undefined>
}