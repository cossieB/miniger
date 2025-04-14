import { For, Setter, Show, Suspense, createEffect, createSignal, on } from "solid-js";
import type { ICellEditor, ICellEditorParams } from "ag-grid-community";
import { getStudios } from "../../api/data";
import { CirclePlusSvg } from "../../icons";
import { createStudio, updateFilmStudio } from "../../api/mutations";
import { createAsync, useAction } from "@solidjs/router";

export function MySelectEditor(props: ICellEditorParams) {
    const studios = createAsync(() => getStudios())

    const [input, setInput] = createSignal("")
    const [selectedStudio, setSelectedStudio] = createSignal({
        name: "",
        id: null as number | null
    })
    const filtered = () => studios()?.filter(s => s.name.toLowerCase().includes(input().toLowerCase()))

    let refInput!: HTMLInputElement;

    const api: ICellEditor = {
        getValue: () => JSON.stringify(selectedStudio())
    };

    createEffect(on(studios, () => {
        refInput.focus()
    }));
    (props as any).ref(api);

    return (
        <Suspense>
            <input
                type="text"
                class="ag-input-field-input ag-text-field-input h-10"
                oninput={e => setInput(e.target.value)}
                value={input()}
                ref={refInput}
            />
            <ul
                id="studio-list"
                class="w-full h-full bg-slate-800 max-h-[50vh] overflow-y-scroll"
            >
                <Option
                    text="Unknown"
                    value={null}
                    setInput={setSelectedStudio}
                    stopEditing={props.stopEditing}
                    filmId={props.data.film_id}
                />
                <For each={filtered()}>
                    {studio =>
                        <Option
                            text={studio.name}
                            value={studio.studio_id}
                            setInput={setSelectedStudio}
                            stopEditing={props.stopEditing}
                            filmId={props.data.film_id}
                        />}
                </For>
                <Show when={input().length > 0}>
                    <AddStudioBtn
                        input={input()}
                        stopEditing={(id: number) => {
                            setSelectedStudio({
                                name: input(),
                                id
                            })
                            props.stopEditing()
                        }}
                        filmId={props.data.film_id}
                    />
                </Show>
            </ul>
        </Suspense>
    );
}

type Props = {
    value: number | null
    text: string
    setInput: Setter<{
        name: string;
        id: number | null;
    }>
    stopEditing: () => void
    filmId: number
}


function Option(props: Props) {
    const updateFilmStudioAction = useAction(updateFilmStudio)
    const studio = {
        id: props.value,
        name: props.text,
    }
    return (
        <li
            class="hover:bg-slate-500 p-1"
            onclick={async () => {
                await updateFilmStudioAction(props.filmId, studio.id);
                props.setInput(studio);
                props.stopEditing();
            }}
        >
            {studio.name}
        </li>
    )
}

type P1 = {
    input: string
    stopEditing: (id: number) => void
    filmId: number
}

function AddStudioBtn(props: P1) {
    const createAction = useAction(createStudio)
    const updateAction = useAction(updateFilmStudio)
    return (
        <button
            type="button"
            onclick={async () => {
                const studioId = await createAction(props.input)
                await updateAction(props.filmId, studioId)
                props.stopEditing(studioId);
            }}
        >
            <CirclePlusSvg />
        </button>
    )
}