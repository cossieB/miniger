import { createAsync } from "@solidjs/router";
import { XIcon } from "lucide-solid";
import { createSignal, createEffect, createMemo, Show, For } from "solid-js";
import { Portal } from "solid-js/web";
import { getTags } from "~/api/data";
import { TABLE_CELL_HEIGHT } from "~/constants";
import clickOutside from "~/lib/clickOutside";
import { useCellContext } from "~/utils/createTable";
import styles from "./TagsCell.module.css";

false && clickOutside

export type TagsCellProps = {
    onUpdate: (val: string[]) => Promise<void>;
};

const DELIMITER = /[;,]/;

function SpinnerIcon(props: { class?: string }) {
    return (
        <svg style="margin-left: 0.125rem;" class={`${styles.iconSpinner} ${props.class ?? ""}`} width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path opacity="0.9" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}

export function TagsCell(props: TagsCellProps) {
    const cell = useCellContext<string[]>();
    const allTags = createAsync(() => getTags(), { initialValue: [] })
    const [edit, setEdit] = createSignal(false);
    const [loading, setLoading] = createSignal(false);
    const [draftTags, setDraftTags] = createSignal<string[]>([]);
    const [inputValue, setInputValue] = createSignal("");

    let inputRef!: HTMLInputElement;
    let containerRef!: HTMLDivElement;
    let isCancelled = false;

    const [oldValue, setOldValue] = createSignal<string[]>(cell.getValue())

    createEffect(() => {
        if (edit()) {
            isCancelled = false;
            setDraftTags(oldValue());
            setInputValue("");
            setTimeout(() => inputRef?.focus(), 0);
        }
    });

    const filteredSuggestions = createMemo(() => {
        const query = inputValue().trim().toLowerCase();
        const selected = new Set(draftTags());
        return allTags()
            .map(tag => tag.tag)
            .filter(tag => !selected.has(tag) && (query === "" || tag.toLowerCase().includes(query)))
    });

    const addTags = (newTags: string[]) => {
        const cleaned = newTags.map(t => t.trim()).filter(Boolean).map(t => t.toLowerCase());
        if (!cleaned.length) return;
        setDraftTags(prev => Array.from(new Set([...prev, ...cleaned])));
    };

    const commitPendingInput = () => {
        const raw = inputValue().trim();
        if (!raw) return;
        addTags(raw.split(DELIMITER));
        setInputValue("");
    };

    const handleInput = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
        const val = e.currentTarget.value;
        if (DELIMITER.test(val)) {
            const parts = val.split(DELIMITER);
            const trailing = parts.pop() ?? "";
            addTags(parts);
            setInputValue(trailing);
        }
        else {
            setInputValue(val);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSave()

        }
        else if (e.key === "Backspace" && inputValue() === "" && draftTags().length > 0) {
            setDraftTags(prev => prev.slice(0, -1));
        }
        else if (e.key === "Escape") {
            e.preventDefault();
            isCancelled = true;
            setEdit(false);
        }
    };

    const handleSave = async () => {
        if (isCancelled) {
            isCancelled = false;
            setEdit(false);
            return;
        }
        if (loading()) return;

        commitPendingInput();
        const newTags = draftTags();
        const oldTags = oldValue();
        const changed = newTags.length !== oldTags.length || newTags.some(t => !oldTags.includes(t));

        if (changed) {
            try {
                setLoading(true);
                await props.onUpdate(newTags);
                setOldValue(newTags)
            }
            catch (error) {
                console.error("Failed to commit tags cell update:", error);
            }
            finally {
                setLoading(false);
            }
        }

        setEdit(false);
    };

    return (
        <div
            class={styles.cellWrapper}
            classList={{ [styles.overflowHidden]: !edit() }}
            style={{
                width: `${cell.column.getSize()}px`,
                height: `${TABLE_CELL_HEIGHT}px`,
                "anchor-name": "--tags-cell" + cell.id
            }}
        >
            <Show
                when={edit()}
                fallback={
                    <button
                        type="button"
                        class={styles.triggerButton}
                        classList={{ [styles.isLoading]: loading() }}
                        onDblClick={() => setEdit(true)}
                        title="Double click to edit"
                    >
                        <div class={styles.tagContainer}>
                            <For each={oldValue().slice(0, 3)}>
                                {tag => (
                                    <span class={styles.tagPill}>
                                        {tag}
                                    </span>
                                )}
                            </For>
                            <Show when={oldValue().length > 3}>
                                <span class={styles.tagPill}>
                                    +{oldValue().length - 3}
                                </span>
                            </Show>
                        </div>
                        <Show when={loading()}>
                            <SpinnerIcon />
                        </Show>
                    </button>
                }
            >
                <Portal>
                    <div
                        ref={containerRef}
                        tabIndex={-1}
                        class={styles.portalWrapper}
                        onKeyDown={handleKeyDown}
                        style={{
                            "position-anchor": "--tags-cell" + cell.id,
                        }}
                        use:clickOutside={() => {
                            isCancelled = true;
                            setEdit(false);
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div class={styles.selectedTags}>
                            <For each={draftTags()}>
                                {(tag, i) => (
                                    <span class={styles.editableTag}>
                                        {tag}
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            disabled={loading()}
                                            class={styles.removeBtn}
                                            onClick={(e) => {
                                                setDraftTags(prev => prev.filter((_, idx) => idx !== i()));
                                                e.stopPropagation()
                                            }}
                                        >
                                            <XIcon size={12} />
                                        </button>
                                    </span>
                                )}
                            </For>
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue()}
                                disabled={loading()}
                                placeholder={draftTags().length === 0 ? "Add tags…" : ""}
                                class={styles.tagInput}
                                onInput={handleInput}
                            />
                        </div>

                        <Show when={loading()}>
                            <SpinnerIcon />
                        </Show>
                        <Show when={filteredSuggestions().length > 0}>
                            <Tags
                                tags={filteredSuggestions()}
                                onClick={(tag) => {
                                    addTags([tag]);
                                    setInputValue("");
                                    inputRef?.focus();
                                }}
                            />                           
                        </Show>
                    </div>
                </Portal>
            </Show>
        </div>
    );
}

type P = {
    tags: string[]
    onClick: (tag: string) => void
}

export function Tags(props: P) {
    return (
        <div class={styles.dropdown}>
            <For each={props.tags}>
                {tag => (
                    <button
                        style={{"view-transition-name": `--tag-${tag}`}}
                        type="button"
                        tabIndex={-1}
                        class={styles.dropdownItem}
                        onClick={e => {
                            props.onClick(tag);
                            e.stopPropagation()
                        }}
                    >
                        {tag}
                    </button>
                )}
            </For>
        </div>
    )
}