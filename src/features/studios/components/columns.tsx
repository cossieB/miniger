import { type TStudio } from "~/datatypes";
import { createAppColumnHelper } from "~/utils/createTable";

const columnHelper = createAppColumnHelper<TStudio>()

export const columns = columnHelper.columns([
    columnHelper.accessor("name", {
        cell: props => <props.cell.TextCell onUpdate={async name => {
            props.table.options.meta?.editStudio!({
                studioId: props.row.original.studioId,
                name
            })
        }} />
    }),
    columnHelper.accessor("website", {
        cell: props => <props.cell.TextCell onUpdate={async website => {
            props.table.options.meta?.editStudio!({
                studioId: props.row.original.studioId,
                website
            })
        }} />
    }),
])