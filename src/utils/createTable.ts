import { tableFeatures, columnSizingFeature, rowSortingFeature, columnResizingFeature, createSortedRowModel, sortFn_alphanumeric, sortFn_datetime, sortFn_text, sortFn_basic, createTableHook, rowSelectionFeature } from "@tanstack/solid-table"
import { LockedCell, TextCell } from "~/components/table-wrapper/Cells"
import { AsyncSelectCell, SelectCell } from "~/components/table-wrapper/SelectCell"

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