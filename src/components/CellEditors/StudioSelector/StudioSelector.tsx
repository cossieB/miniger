import { type Accessor, For, Show, Suspense, createEffect, createSignal, on } from "solid-js";
import { getStudios } from "../../../api/data";
import { createStudio, editFilm } from "../../../api/mutations";
import { createAsync, useAction } from "@solidjs/router";
import { HoldClickBtn } from "../../HoldClickBtn";
import { Option } from "./StudioOption";

type P = {
    setSelectedStudio: (studio: {
        name: string;
        studioId: number | null;
    }) => void
    filmId?: number
}

export function StudioSelector(props: P) {
    let refInput!: HTMLInputElement;
    const studios = createAsync(() => getStudios())

    const [input, setInput] = createSignal("")
    const filtered = () => studios()?.filter(s => s.name.toLowerCase().includes(input().toLowerCase()))

    createEffect(on(studios, () => {
        refInput.focus()
    }));

    return (
        <Suspense>
            <input
                type="text"
                class="ag-input-field-input ag-text-field-input h-10"
                placeholder="Filter Studios"
                oninput={e => setInput(e.target.value)}
                value={input()}
                ref={refInput}
            />
            <ul
                id="studio-list"
                class="w-full h-full bg-slate-800 max-h-[50vh] overflow-y-scroll isolate"
            >
                <Option
                    text="Unknown"
                    value={null}
                    handleChange={() => props.setSelectedStudio({ name: "Unknown", studioId: null })}
                />
                <For each={filtered()}>
                    {studio =>
                        <Option
                            text={studio.name}
                            value={studio.studioId}
                            handleChange={() => props.setSelectedStudio(studio)}
                        />}
                </For>
                <Show when={input().length > 0 && props.filmId}>
                    <AddStudioBtn
                        input={input}
                        filmId={props.filmId!}
                        clearInput={() => setInput("")}
                        setSelectedStudio={studio => props.setSelectedStudio(studio)}
                    />
                </Show>
            </ul>
        </Suspense>
    );
}

type P1 = {
    input: Accessor<string>
    filmId: number
    clearInput: () => void
} & Pick<P, 'setSelectedStudio'>

function AddStudioBtn(props: P1) {
    const createAction = useAction(createStudio)
    const updateAction = useAction(editFilm)
    return (
        <HoldClickBtn
            action={async () => {
                const studioId = await createAction(props.input())
                await updateAction({filmId: props.filmId, studioId})
                props.setSelectedStudio({
                    name: props.input(), studioId
                })
            }}
            clearInput={props.clearInput}
            input={props.input}
        />
    )
}