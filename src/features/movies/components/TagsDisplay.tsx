import { XIcon } from "lucide-solid";
import { For } from "solid-js";
import styles from "./TagsDisplay.module.css"

type Props = {
    tags: string[]
    onRemove: (tag: string) => void
}

export function TagsDisplay(props: Props) {
    return (
        <div class={styles.tagsDisplay}>
            <For each={props.tags}>
                {tag => (
                    <div style={{ "view-transition-name": `--tag-${tag}` }}>
                        <span>{tag}</span>
                        <button onClick={() => props.onRemove(tag)}>
                            <XIcon size={16} />
                        </button>
                    </div>
                )}
            </For>
        </div>
    )
}