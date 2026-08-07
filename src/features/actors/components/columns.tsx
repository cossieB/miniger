import { countryList } from "~/countryList";
import { type TActor } from "~/datatypes";
import { createAppColumnHelper } from "~/utils/createTable";

const columnHelper = createAppColumnHelper<TActor & {appearances: number | bigint | string}>()

export const columns = columnHelper.columns([
    columnHelper.accessor("name", {
        cell: props => <props.cell.TextCell
            onUpdate={async name => {
                props.table.options.meta?.updateActor!({
                    actorId: props.row.original.actorId,
                    name
                }, [])
            }}
        />
    }),
    columnHelper.accessor("gender", {
        cell: props => <props.cell.SelectCell
            options={["M", "F"]}
            initialValue={props.row.original.gender ?? undefined}
            onUpdate={async gender => {
                props.table.options.meta?.updateActor!({
                    actorId: props.row.original.actorId,
                    gender: gender || null
                }, [])
            }}
        />,
        size: 70
    }),
    columnHelper.accessor("dob", {
        cell: props => <props.cell.TextCell
            type="date"
            onUpdate={async dob => {
                props.table.options.meta?.updateActor!({
                    actorId: props.row.original.actorId,
                    dob
                }, [])
            }}
        />
    }),
    columnHelper.accessor("nationality", {
        cell: props => <props.cell.SelectCell
            options={countryList}
            initialValue={props.row.original.nationality ?? undefined}
            onUpdate={async nationality => {
                props.table.options.meta?.updateActor!({
                    actorId: props.row.original.actorId,
                    nationality: nationality || null
                }, [])
            }}
        />
    }),
    columnHelper.accessor("image", {
        cell: props => <props.cell.ImageEditor
            onUpdate={async image => {
                props.table.options.meta?.updateActor!({
                    actorId: props.row.original.actorId,
                    image
                }, [])
            }}
        />
    }),
    columnHelper.accessor("appearances", {
        header: "films",
        size: 70,
        cell: props => <props.cell.LockedCell style={{
            "text-align": "right"
        }} />
    })
])