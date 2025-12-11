import { createSignal, Show, Suspense } from "solid-js";
import { getStudios } from "../api/data";
import { createStore } from "solid-js/store";
import { ContextMenu } from "../components/ContextMenu/ContextMenu";
import { type AgGridSolidRef } from "ag-grid-solid";
import { createStudio, updateStudio } from "../api/mutations";
import { createAsync, useAction } from "@solidjs/router";
import { fixPinnedRowHeight, useFilter } from "~/utils/pinnedUtils";
import { PinnedRowButtons } from "~/components/PinnedRowButtons";
import { GridWrapper } from "~/components/GridWrapper";
import { enc } from "~/utils/encodeDecode";

export default function Studios() {
    const studios = createAsync(() => getStudios())
    const updateAction = useAction(updateStudio)
    const addStudioAction = useAction(createStudio)
    let [ref, setRef] = createSignal<AgGridSolidRef>()
    const [contextMenu, setContextMenu] = createStore({
        isOpen: false,
        selectedId: -1,
        selectedName: "",
        pos: { x: 0, y: 0 },
    })
    const [input, setInput] = createStore({
        name: "",
        website: null as string | null,
    })

    useFilter(ref, 'name', () => input.name)

    function reset() {
        ref()?.api.setFilterModel(null);
        ref()?.api.setGridOption("pinnedBottomRowData", [{ name: "Add Studio..." }]);
        setInput({
            name: "",
            website: null,
        });
    }

    return (
        <Suspense>
            <div
                id='gridContainer'
                class='ag-theme-alpine-dark h-full relative'
            >
                <GridWrapper
                    ref={setRef}
                    rowData={studios()}
                    getRowId={params => params.data.studioId.toString()}
                    additionalSetup={fixPinnedRowHeight}
                    rowSelection="multiple"
                    defaultColDef={{
                        editable: true,
                        sortable: true,
                        suppressKeyboardEvent: ({ event }) => event.key === "Delete",
                        onCellValueChanged: params => {
                            if (!params.colDef.field || !params.node) return;
                            if (!params.node.rowPinned) {
                                updateAction({[
                                    params.colDef.field]: params.newValue,
                                    studioId: params.data.studioId
                                })
                                return;
                            }
                            const field: any = params.colDef.field;
                            setInput(field, params.newValue)
                        }
                    }}
                    onCellContextMenu={params => {
                        setContextMenu({
                            isOpen: true,
                            pos: {
                                x: (params.event as MouseEvent).clientX,
                                y: (params.event as MouseEvent).clientY,
                            },
                            selectedId: params.data!.studioId,
                            selectedName: params.data!.name,
                        })
                    }}
                    columnDefs={[{
                        field: 'name',
                        filter: true
                    }, {
                        field: "website"
                    }]}
                    pinnedBottomRowData={[{
                        name: "Add Studio..."
                    }]}
                    getRowStyle={({ node }) => node.rowPinned ? { 'font-weight': 'bold', 'font-style': 'italic' } : undefined}
                />
                <Show when={contextMenu.isOpen}>
                    <ContextMenu pos={contextMenu.pos} close={() => setContextMenu('isOpen', false)} >
                        <ContextMenu.Link href={`/movies/studios/${enc({display:contextMenu.selectedName, id: contextMenu.selectedId})}`}> Go To Movies </ContextMenu.Link>
                    </ContextMenu>
                </Show>
                <PinnedRowButtons
                    input={input}
                    key="name"
                    reset={reset}
                    addAction={addStudioAction}
                />
            </div>
        </Suspense>
    )
}