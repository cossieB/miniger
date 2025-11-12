import { A, createAsync } from "@solidjs/router"
import { ICellRendererParams, ITooltipParams } from "ag-grid-community"
import { createEffect, Show, Suspense } from "solid-js"
import { createStore } from "solid-js/store"
import { allPairings } from "~/api/actors"
import { ActorItem2 } from "~/components/CellEditors/ActorCellEditor/ActorItem"
import { ContextMenu } from "~/components/ContextMenu/ContextMenu"
import { GridWrapper } from "~/components/GridWrapper"

type P = ReturnType<Awaited<typeof allPairings>>

type Props = {
    fetcher(): P
}

export function Costars(props: Props) {
    const data = createAsync(() => props.fetcher())

    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        pos: { x: 0, y: 0 },
        actorAid: -1,
        actorBid: -1,
        actorA: "",
        actorB: "",
    })

    return (
        <Suspense>
            <div
                id='gridContainer'
                class='ag-theme-alpine-dark h-full relative'
                onContextMenu={(e) => {
                    e.preventDefault();
                    return false
                }}
            >
                <GridWrapper
                    rowData={data()}
                    onCellContextMenu={params => {
                        setContextMenu({
                            isOpen: true,
                            pos: {
                                x: (params.event as MouseEvent).clientX,
                                y: (params.event as MouseEvent).clientY,
                            },
                            ...params.data
                        })
                    }}
                    columnDefs={[{
                        field: "actorA",
                        headerName: "Actor",
                        tooltipComponent: Tooltip,
                        tooltipValueGetter: params => ({
                            name: params.data!.actorA,
                            image: params.data!.actorAimage
                        }),
                    }, {
                        field: 'actorB',
                        headerName: "Co-Star",
                        tooltipComponent: Tooltip,
                        tooltipValueGetter: params => ({
                            name: params.data!.actorB,
                            image: params.data!.actorBimage
                        }),
                    }, {
                        field: "together",
                        headerName: "Movies",
                    }, {                        
                        cellRenderer: (params: ICellRendererParams) => <A href={`/movies/actors/${params.data.actorAid}/${params.data.actorBid}?${params.data.actorAid}=${params.data.actorA}&${params.data.actorBid}=${params.data.actorB}`}>View Movies</A>
                    }]}
                />
            </div>
            <Show when={contextMenu.isOpen}>
                <ContextMenu pos={contextMenu.pos} close={() => setContextMenu('isOpen', false)} >
                    <ContextMenu.Link href={`/movies/actors/${contextMenu.actorAid}?${contextMenu.actorAid}=${contextMenu.actorA}`}> <span class="font-bold whitespace-pre">{contextMenu.actorA} </span>Movies </ContextMenu.Link>
                    <ContextMenu.Link href={`/movies/actors/${contextMenu.actorBid}?${contextMenu.actorBid}=${contextMenu.actorB}`}> <span class="font-bold whitespace-pre">{contextMenu.actorB} </span>Movies </ContextMenu.Link>
                </ContextMenu>
            </Show>
        </Suspense>
    )
}

function Tooltip(param: ITooltipParams) {
    return (
        <ActorItem2
            actor={{
                name: param.value.name,
                image: param.value.image,
            }}
        />
    )
}