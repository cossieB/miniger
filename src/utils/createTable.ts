import { tableFeatures, columnSizingFeature, rowSortingFeature, columnResizingFeature, createSortedRowModel, sortFn_alphanumeric, sortFn_datetime, sortFn_text, sortFn_basic, createTableHook, rowSelectionFeature, metaHelper } from "@tanstack/solid-table"
import { LockedCell, TextCell } from "~/components/table-wrapper/Cells"
import { AsyncSelectCell, SelectCell } from "~/components/table-wrapper/SelectCell"
import type { TFilm, TStudio } from "~/datatypes"
import type { OptionalExcept } from "~/lib/utilityTypes"

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
    tableMeta: metaHelper<TableMeta>()
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

type TableMeta = {
    updateFilm?: (f: Partial<Omit<TFilm, "filmId">> & {
        actorIds?: number[];
        tags?: string[];
    } & {
        filmId: number;
    }, revalidate?: string[] | undefined) => Promise<{
        title: string;
        metadata: string | null;
        path: string;
        releaseDate: string | null;
        dateAdded: string;
        filmId: number;
        studioId: number | null;
    } | undefined>,

    editStudio?: (s: OptionalExcept<TStudio, "studioId">) => Promise<{
        name: string;
        studioId: number;
        website: string | null;
    }>
}