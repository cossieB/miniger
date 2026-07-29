import { createAsync } from "@solidjs/router"
import { For, type Setter, Suspense } from "solid-js"
import { getTags } from "~/api/data"
import clickOutside from "~/lib/clickOutside"
false && clickOutside

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
