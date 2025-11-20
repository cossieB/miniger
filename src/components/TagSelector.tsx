import { ReactiveSet } from "@solid-primitives/set"
import { createAsync } from "@solidjs/router"
import { ICellEditor, ICellEditorParams } from "ag-grid-community"
import { createEffect, createSignal, For, Suspense } from "solid-js"
import { getTags } from "~/api/data"
import { CancelSvg, CheckmarkSvg } from "~/icons"

export function AgTagSelector(props: ICellEditorParams) {
    const [tags, setTags] = createSignal<string[]>(props.value)
    let ref!: HTMLInputElement
    const api: ICellEditor = {
        getValue: () => ref.value.split(/[,;]/)
    };
    (props as any).ref(api);

    return (
        <div class="bg-slate-800 w-[50vw] fixed left-1/2 -translate-x-1/2 shadow-[0_0_5px_5px_black]">
            <input
                ref={ref}
                class="ag-input-field-input ag-text-field-input h-10"
                type="text"
                value={tags().join(", ")}
                placeholder="Enter tags separated by a comma"
            />
            <div class="flex justify-end my-3">
                <button
                    class="rounded-full p-1 bg-red-500 mr-1"
                    onclick={() => {
                        setTags(props.data.tags)
                        props.stopEditing()
                    }}
                >
                    <CancelSvg />
                </button>
                <button
                    class="rounded-full p-1 bg-lime-500 mr-1"
                    onclick={() => {
                        props.stopEditing()
                    }}
                >
                    <CheckmarkSvg />
                </button>
            </div>
            <div class="p-1">
            <TagSelector
                selectedTags={tags()}
                setTags={setTags}
                />
                </div>
        </div>
    )
}

type Props = {
    selectedTags: string[]
    setTags: (tags: string[]) => void
}

export function TagSelector(props: Props) {
    const tags = createAsync(() => getTags(), { initialValue: [] })
    const selectedTags = new ReactiveSet(props.selectedTags)

    createEffect(() => {
        props.setTags(Array.from(selectedTags))
    })

    return (
        <Suspense>
            <ul class="flex flex-wrap gap-1.5 w-full">
                <For each={tags()}>
                    {tag =>
                        <TagItem
                            tag={tag.tag}
                            selectedTags={selectedTags}
                        />
                    }
                </For>
            </ul>
        </Suspense>
    )
}

type P = {
    tag: string
    selectedTags: ReactiveSet<string>
}

function TagItem(props: P) {
    const isSelected = () => props.selectedTags.has(props.tag)

    function toggleTag() {
        if (isSelected())
            props.selectedTags.delete(props.tag)
        else
            props.selectedTags.add(props.tag)
    }
    return (
        <li class="bg-slate-400 p-1" classList={{ "bg-slate-700 ": isSelected() }} onclick={toggleTag}>
            {props.tag}
        </li>
    )
}