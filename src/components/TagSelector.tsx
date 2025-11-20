import { ReactiveSet } from "@solid-primitives/set"
import { createAsync } from "@solidjs/router"
import { createEffect, For } from "solid-js"
import { getTags } from "~/api/data"

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