import { createAsync } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { getTags } from "~/api/data";
import { ContextMenu } from "~/components/ContextMenu/ContextMenu";
import { GridWrapper } from "~/components/GridWrapper";

export function Tags() {
    const data = createAsync(() => getTags())

    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        selectedTag: "",
        pos: { x: 0, y: 0 },
    })
    return (
        <Suspense>
            <div
                id='gridContainer'
                class='ag-theme-alpine-dark h-full relative'
            >
                <GridWrapper
                    rowData={data()}
                    columnDefs={[{
                        field: "tag"
                    }, {
                        field: "films"
                    }]}
                    onCellContextMenu={params => {
                        setContextMenu({
                            isOpen: true,
                            pos: {
                                x: (params.event as MouseEvent).clientX,
                                y: (params.event as MouseEvent).clientY,
                            },
                            selectedTag: params.data!.tag,
                        })
                    }}
                />
                <Show when={contextMenu.isOpen}>
                    <ContextMenu pos={contextMenu.pos} close={() => setContextMenu('isOpen', false)}>
                        <ContextMenu.Link href={`/movies/tags/${contextMenu.selectedTag}`} >
                            See All Films
                        </ContextMenu.Link>
                    </ContextMenu>
                </Show>
            </div>
        </Suspense>
    )
}