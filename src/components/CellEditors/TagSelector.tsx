import { createAsync, useAction } from "@solidjs/router"
import { type ICellEditor, type ICellEditorParams } from "ag-grid-community"
import { createSignal, For, type Setter, Suspense } from "solid-js"
import { getTags } from "~/api/data"
import { CancelSvg, CheckmarkSvg } from "~/icons"
import { updateTag } from "~/api/mutations"
import clickOutside from "~/lib/clickOutside"
false && clickOutside

export function AgTagSelector(props: ICellEditorParams) {
    const updateTagAction = useAction(updateTag)
    const [tags, setTags] = createSignal<string[]>(props.value)

    async function handleSubmit() {
        await updateTagAction(props.data.filmId, tags())
        props.stopEditing()
    }

    let ref!: HTMLInputElement

    const api: ICellEditor = {
        getValue: () => tags()
    };
    (props as any).ref(api);

    return (
        <div
            class="bg-slate-800 w-[50vw] shadow-[0_0_5px_5px_black]"
        >
            <div class="flex justify-end my-3">
                <input
                    ref={ref}
                    class="ag-input-field-input ag-text-field-input h-10"
                    type="text"
                    value={tags().join(", ")}
                    onchange={e => {
                        setTags(e.currentTarget.value.trim().split(/[,;]+\s*/).filter(x => !!x))
                    }}

                    placeholder="Enter tags separated by a comma"
                />
                <button
                    class="p-1 bg-red-500 w-10 justify-center items-center flex"
                    onclick={() => {
                        setTags(props.value)
                        props.stopEditing()
                    }}
                >
                    <CancelSvg />
                </button>
                <button
                    class="p-1 bg-lime-500 w-10 justify-center items-center flex"
                    onclick={handleSubmit}
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
    setTags: Setter<string[]>
}

export function TagSelector(props: Props) {
    const tags = createAsync(() => getTags())

    function toggleTag(tag: string) {
        if (props.selectedTags.includes(tag))
            props.setTags(prev => prev.filter(t => t != tag))
        else
            props.setTags(prev => [...prev, tag])
    }

    return (
        <Suspense>
            <ul class="flex flex-wrap gap-1.5 w-full">
                <For each={tags()}>
                    {tag =>
                        <li
                            class="bg-gray-600 h-8 p-2 flex-1 whitespace-nowrap flex items-center justify-center"
                            classList={{ "bg-slate-950!": props.selectedTags.includes(tag.tag) }}
                            onclick={() => toggleTag(tag.tag)}
                        >
                            {tag.tag}
                        </li>
                    }
                </For>
            </ul>
        </Suspense>
    )
}
