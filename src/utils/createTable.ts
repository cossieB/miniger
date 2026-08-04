import { tableFeatures, columnSizingFeature, rowSortingFeature, columnResizingFeature, createSortedRowModel, sortFn_alphanumeric, sortFn_datetime, sortFn_text, sortFn_basic, createTableHook, rowSelectionFeature, metaHelper } from "@tanstack/solid-table"
import { LockedCell, TextCell } from "~/components/tables/Cells"
import { AsyncSelectCell, SelectCell } from "~/components/tables/SelectCell"
import type { TActor, TFilm, TStudio } from "~/datatypes"
import { ImageEditor } from "~/components/tables/ImageEditor"
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
        AsyncSelectCell,
        ImageEditor
    }
})

export type AppTableFeatures = typeof features

type TableMeta = {
    updateFilm?: (f: Partial<Omit<TFilm, "filmId">> & {
        actorIds?: number[];
        tags?: string[];
    } & {
        filmId: number;
    }, revalidate?: string[] | undefined) => Promise<TFilm | undefined>,

    editStudio?: (s: OptionalExcept<TStudio, "studioId">, revalidate?: string[]) => Promise<TStudio>

    updateActor?: (a: OptionalExcept<TActor, "actorId">, revalidate?: string[]) => Promise<{
        actorId: number;
        dob: string | null;
        gender: string | null;
        image: string | null;
        name: string;
        nationality: string | null;
    } | undefined>

}