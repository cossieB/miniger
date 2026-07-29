import { createAsync } from "@solidjs/router";
import { XIcon } from "lucide-solid";
import { createSignal, createEffect, createMemo, Show, For } from "solid-js";
import { Portal } from "solid-js/web";
import { getTags } from "~/api/data";
import { TABLE_CELL_HEIGHT } from "~/constants";
import clickOutside from "~/lib/clickOutside";
import { useCellContext } from "~/utils/createTable";

false && clickOutside

export type TagsCellProps = {
    onUpdate: (val: string[]) => Promise<void>;
};

const DELIMITER = /[;,]/;

function SpinnerIcon(props: { class?: string }) {
    return (
        <svg class={`animate-spin ${props.class ?? ""}`} width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
            class="flex flex-col justify-center px-2 relative"
            classList={{ "overflow-hidden": !edit() }}
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
                        class="group/cell -mx-1.5 flex min-w-0 h-full items-center gap-1 rounded px-1.5 py-1 text-left outline-none transition-colors duration-100 hover:bg-zinc-800/80 focus-visible:ring-1 focus-visible:ring-zinc-500"
                        classList={{ "opacity-60": loading() }}
                        onDblClick={() => setEdit(true)}
                        title="Double click to edit"
                    >
                        <div class="flex min-w-0 flex-wrap items-center gap-1 overflow-hidden h-full">
                            <For each={oldValue().slice(0, 3)}>
                                {tag => (
                                    <span class="shrink-0 truncate rounded-full bg-zinc-700/70 px-2 py-0.5 text-xs font-medium text-zinc-200">
                                        {tag}
                                    </span>
                                )}
                            </For>
                            <Show when={oldValue().length > 3}>
                                <span class="shrink-0 truncate rounded-full bg-zinc-700/70 px-2 py-0.5 text-xs font-medium text-zinc-200">
                                    +{oldValue().length - 3}
                                </span>
                            </Show>
                        </div>
                        <Show when={loading()}>
                            <SpinnerIcon class="ml-0.5 shrink-0 text-zinc-400" />
                        </Show>
                    </button>
                }
            >
                <Portal>
                    <div
                        ref={containerRef}
                        tabIndex={-1}
                        class="absolute z-999 -mx-1.5 flex flex-wrap items-center gap-1 rounded border border-zinc-600 bg-zinc-800 px-1.5 py-1 shadow-[0_0_0_3px_rgba(255,255,255,0.04)] ring-1 ring-inset ring-zinc-500/40 transition-colors focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-400/60"
                        onKeyDown={handleKeyDown}
                        style={{
                            "position-anchor": "--tags-cell" + cell.id,
                            top: "anchor(top)",
                            left: "anchor(left)"
                        }}
                        use:clickOutside={() => {
                            handleSave()
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <For each={draftTags()}>
                            {(tag, i) => (
                                <span class="flex shrink-0 items-center gap-1 rounded-full bg-zinc-700 py-0.5 pl-2 pr-1 text-xs font-medium text-zinc-100">
                                    {tag}
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        disabled={loading()}
                                        class="rounded-full p-0.5 text-zinc-400 transition-colors hover:bg-zinc-600 hover:text-red-300 disabled:pointer-events-none"
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
                            class="min-w-16 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed"
                            onInput={handleInput}
                        />

                        <Show when={loading()}>
                            <SpinnerIcon class="shrink-0 text-zinc-400" />
                        </Show>

                        <Show when={filteredSuggestions().length > 0}>
                            <div class="absolute left-0 top-full mt-1 max-h-48 w-max min-w-full overflow-y-auto rounded border border-zinc-700 bg-zinc-800 py-1 shadow-lg shadow-black/40">
                                <For each={filteredSuggestions()}>
                                    {tag => (
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            class="block w-full whitespace-nowrap px-3 py-1 text-left text-sm text-zinc-200 hover:bg-zinc-700"
                                            onClick={(e) => {
                                                addTags([tag]);
                                                setInputValue("");
                                                inputRef?.focus();
                                                e.stopPropagation()
                                            }}
                                        >
                                            {tag}
                                        </button>
                                    )}
                                </For>
                            </div>
                        </Show>
                    </div>
                </Portal>
            </Show>
        </div>
    );
}