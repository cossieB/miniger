import { tableFeatures, columnSizingFeature, rowSortingFeature, columnResizingFeature, createSortedRowModel, sortFn_alphanumeric, sortFn_datetime, sortFn_text, sortFn_basic, createTableHook } from "@tanstack/solid-table"

const features = tableFeatures({
    columnSizingFeature,
    rowSortingFeature,
    columnResizingFeature,
    sortedRowModel: createSortedRowModel(),
    sortFns: {
        alphanumeric: sortFn_alphanumeric,
        datetime: sortFn_datetime,
        text: sortFn_text,
        basic: sortFn_basic
    },
})

export const {createAppTable, createAppColumnHelper} = createTableHook({
    features,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
})

export type AppTableFeatures = typeof features