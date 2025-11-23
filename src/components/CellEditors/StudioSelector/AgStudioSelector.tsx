import { useAction } from "@solidjs/router";
import type { ICellEditorParams, ICellEditor } from "ag-grid-community";
import { createSignal } from "solid-js";
import { editFilm } from "~/api/mutations";
import { StudioSelector } from "./StudioSelector";


export function AgStudioSelector(props: ICellEditorParams) {
    const updateAction = useAction(editFilm);
    const [selectedStudio, setSelectedStudio] = createSignal({
        name: "",
        studioId: null as number | null
    });
    const api: ICellEditor = {
        getValue: () => {
            console.log(selectedStudio())
            return JSON.stringify(selectedStudio())
        }
    };
    (props as any).ref(api);

    return <StudioSelector
        setSelectedStudio={async (studio) => {
            setSelectedStudio(studio);
            await updateAction({filmId: props.data.filmId, studioId: studio.studioId});
            props.stopEditing();
        } }
        filmId={props.data.filmId} />;
}
