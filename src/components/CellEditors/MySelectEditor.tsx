import { For, Setter, Show, createResource, createSignal, onMount } from "solid-js";
import type { ICellEditor, ICellEditorParams } from "ag-grid-community";
import { getStudios } from "../../api/data";
import { CreateActorSvg } from "../../icons";
import { createStudio, updateFilmStudio } from "../../api/actions";
import { useAction } from "@solidjs/router";
import { Studio } from "../../datatypes";

export const [studios, { refetch: refetchStudios }] = createResource(async () => getStudios())
const [addedStudios, setAddedStudios] = createSignal<Studio[]>([])

export function MySelectEditor(props: ICellEditorParams) {
    const [input, setInput] = createSignal("")
    const [value, setValue] = createSignal("")
    const filtered = () => studios()?.filter(s => s.name.toLowerCase().includes(input().toLowerCase()))

    let refInput!: HTMLInputElement;

    const api: ICellEditor = {
        getValue: () => value()
    };

    onMount(() => {
        refInput.focus()
    });
    (props as any).ref(api);

    return (
        <>
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
                    value={-1}
                    setInput={setValue}
                    stopEditing={props.stopEditing}
                    filmId={props.data.film_id}
                />
                <For each={filtered()}>
                    {studio =>
                        <Option
                            text={studio.name}
                            value={studio.studio_id}
                            setInput={setValue}
                            stopEditing={props.stopEditing}
                            filmId={props.data.film_id}
                        />}
                </For>
                <For each={addedStudios()?.filter(s => s.name.toLowerCase().includes(input().toLowerCase()))}>
                    {studio =>
                        <Option
                            text={studio.name}
                            value={studio.studio_id}
                            setInput={setValue}
                            stopEditing={props.stopEditing}
                            filmId={props.data.film_id}
                        />}
                </For>
                <Show when={input().length > 0}>
                    <AddStudioBtn
                        input={input()}
                        stopEditing={() => {
                            setValue(input())
                            props.stopEditing()
                        }}
                        filmId={props.data.film_id}
                    />
                </Show>
            </ul>
        </>
    );
}

type Props = {
    value: number
    text: string
    setInput: Setter<string>
    stopEditing: () => void
    filmId: number
}

function Option(props: Props) {
    const updateStudioAction = useAction(updateFilmStudio)
    return (
        <li
            class="hover:bg-slate-500 p-1"
            onclick={async () => {
                await updateStudioAction(props.filmId, props.value);
                props.setInput(props.text == "Unknown" ? "" : props.text);
                props.stopEditing();
            }}
        >
            {props.text}
        </li>
    )
}

type P1 = {
    input: string
    stopEditing: () => void
    filmId: number
}

function AddStudioBtn(props: P1) {
    const updateStudioAction = useAction(updateFilmStudio)
    const createStudioAction = useAction(createStudio)
    return (
        <button
            type="button"
            onclick={async () => {
                const row = await createStudioAction(props.input)
                setAddedStudios(p => [...p, ...row])
                const studioId = row[0].studio_id
                await updateStudioAction(props.filmId, studioId)
                props.stopEditing();
            }}
        >
            <CreateActorSvg />
        </button>
    )
}