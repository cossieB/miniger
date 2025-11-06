import { A, createAsync } from "@solidjs/router"
import { ICellRendererParams } from "ag-grid-community"
import { Show, Suspense } from "solid-js"
import { createStore } from "solid-js/store"
import { ContextMenu } from "~/components/ContextMenu/ContextMenu"
import { GridWrapper } from "~/components/GridWrapper"
import { PairingResult } from "~/datatypes"

type Props = {
    fetcher(): Promise<PairingResult[] | undefined>
}

export function Costars(props: Props) {
    const data = createAsync(() => props.fetcher())

    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        pos: { x: 0, y: 0 },
        actorAId: -1,
        actorBId: -1,
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
                    }, {
                        field: 'actorB',
                        headerName: "Co-Star"
                    }, {
                        field: "together",
                        headerName: "Movies",
                    }, {
                        field: "",
                        cellRenderer: (params: ICellRendererParams) => <A href={`/movies/actors/${params.data.actorAId}/${params.data.actorBId}?${params.data.actorAId}=${params.data.actorA}&${params.data.actorBId}=${params.data.actorB}`}>View Movies</A>
                    }]}
                />
            </div>
            <Show when={contextMenu.isOpen}>
                <ContextMenu pos={contextMenu.pos} close={() => setContextMenu('isOpen', false)} >
                    <ContextMenu.Link href={`/movies/actors/${contextMenu.actorAId}?${contextMenu.actorAId}=${contextMenu.actorA}`}> <span class="font-bold whitespace-pre">{contextMenu.actorA} </span>Movies </ContextMenu.Link>
                    <ContextMenu.Link href={`/movies/actors/${contextMenu.actorBId}?${contextMenu.actorBId}=${contextMenu.actorB}`}> <span class="font-bold whitespace-pre">{contextMenu.actorB} </span>Movies </ContextMenu.Link>
                </ContextMenu>
            </Show>
        </Suspense>
    )
}