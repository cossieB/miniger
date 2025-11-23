import { useAction } from "@solidjs/router";
import type { ICellEditorParams, ICellEditor } from "ag-grid-community";
import { createSignal } from "solid-js";
import { updateFilmStudio } from "~/api/mutations";
import { StudioSelector } from "./StudioSelector";


export function AgStudioSelector(props: ICellEditorParams) {
    const updateFilmStudioAction = useAction(updateFilmStudio);
    const [selectedStudio, setSelectedStudio] = createSignal({
        name: "",
        studioId: null as number | null
    });
    const api: ICellEditor = {
        getValue: () => JSON.stringify(selectedStudio())
    };
    (props as any).ref(api);

    return <StudioSelector
        setSelectedStudio={async (studio) => {
            setSelectedStudio(studio);
            await updateFilmStudioAction(props.data.filmId, studio.studioId);
            props.stopEditing();
        } }
        filmId={props.data.filmId} />;
}
