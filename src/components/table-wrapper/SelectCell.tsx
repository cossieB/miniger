import { createAsync } from "@solidjs/router";
import { splitProps, createSignal, createEffect, Show, For, type ComponentProps, createMemo } from "solid-js";
import { useCellContext } from "~/utils/createTable";

export type SelectOption = { label: string; value: string } | string;

export type SelectCellProps = {
    options: SelectOption[];
    onUpdate: (val: string) => Promise<void>;
    value?: string | number
} & Omit<ComponentProps<"select">, "onChange" | "onBlur">;

export function SelectCell(props: SelectCellProps) {
    const [local, selectProps] = splitProps(props, ["options", "onUpdate"]);

    const cell = useCellContext<string>();
    const [edit, setEdit] = createSignal(false);
    const [loading, setLoading] = createSignal(false);

    let selectRef!: HTMLSelectElement;
    let isCancelled = false;

    const normalizedOptions = createMemo(() =>
        local.options.map(opt =>
            typeof opt === "string" ? { label: opt, value: opt } : opt
        )
    );

    const currentLabel = createMemo(() => {
        const val = cell.getValue();
        const match = normalizedOptions().find(opt => opt.value === val);
        return match ? match.label : val;
    });

    createEffect(() => {
        if (edit()) {
            isCancelled = false;
            setTimeout(() => selectRef?.focus(), 0);
        }
    });

    const handleSave = async () => {
        if (isCancelled || loading()) return;

        const newValue = selectRef.value;
        const oldValue = cell.getValue();
        if (newValue === oldValue) return
        try {
            setLoading(true);
            await local.onUpdate(newValue);
        }
        catch (error) {
            console.error("Failed to commit select cell update:", error);
        }
        finally {
            setLoading(false);
        }

        setEdit(false);
    };

    return (
        <div
            class="flex flex-col justify-center overflow-hidden px-2"
            style={{
                width: `${cell.column.getSize()}px`
            }}
        >
            <Show
                when={edit()}
                fallback={
                    <button
                        type="button"
                        class="group/cell -mx-1.5 flex min-w-0 items-center gap-1.5 rounded px-1.5 py-0.5 text-left outline-none transition-colors duration-100 hover:bg-zinc-800/80 focus-visible:ring-1 focus-visible:ring-zinc-500"
                        classList={{ "opacity-60": loading() }}
                        onDblClick={() => setEdit(true)}
                        title="Double click to edit"
                    >
                        <span class="min-w-0 truncate text-ellipsis font-medium text-zinc-100 transition-colors group-hover/cell:text-white">
                            {currentLabel() || <span class="italic text-zinc-500">Empty</span>}
                        </span>
                        <Show when={loading()} fallback={
                            <ChevronIcon class="shrink-0 text-zinc-600 opacity-0 transition-opacity group-hover/cell:opacity-100" />
                        }>
                            <SpinnerIcon class="shrink-0 text-zinc-400" />
                        </Show>
                    </button>
                }
            >
                <div class="relative -mx-1.5">
                    <select
                        {...selectProps}
                        value={props.value}
                        ref={selectRef}
                        disabled={loading() || selectProps.disabled}
                        class={`w-full cursor-pointer appearance-none truncate text-ellipsis rounded border border-zinc-600 bg-zinc-800 py-0.5 pl-1.5 pr-5 font-medium text-zinc-100 shadow-[0_0_0_3px_rgba(255,255,255,0.04)] outline-none ring-1 ring-inset ring-zinc-500/40 transition-colors focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/60 disabled:cursor-not-allowed disabled:opacity-50 ${selectProps.class || ""}`}
                        onChange={() => {
                            selectRef.blur();
                        }}
                        onBlur={handleSave}
                        onKeyDown={e => {
                            if (e.key === "Escape") {
                                isCancelled = true;
                                setEdit(false);
                            }
                        }}
                    >
                        <option value="">Unknown</option>
                        <For each={normalizedOptions()}>
                            {option => (
                                <option
                                    value={option.value}
                                    selected={option.value === props.value}
                                >
                                    {option.label}
                                </option>
                            )}
                        </For>
                    </select>
                    <ChevronIcon class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400" />
                </div>
            </Show>
        </div>
    );
}

type AsyncSelectCellProps<T> = {
    getOptions: () => Promise<T[]>;
    normalize: (item: T) => { label: string; value: string };
    onUpdate: (val: string) => Promise<void>;
    value?: string | number
} & Omit<ComponentProps<"select">, "options" | "onChange" | "onBlur">;

export function AsyncSelectCell<T>(props: AsyncSelectCellProps<T>) {
    const [local, selectProps] = splitProps(props, ["getOptions", "normalize", "onUpdate"]);

    const rawOptions = createAsync(() => local.getOptions(), { initialValue: [] });

    const normalizedOptions = createMemo(() => {
        const options = rawOptions();
        if (!options) return [];
        return options.map(local.normalize);
    });

    return (
        <SelectCell
            options={normalizedOptions()}
            onUpdate={local.onUpdate}
            disabled={!rawOptions()}
            {...selectProps}
        />
    );
}

function ChevronIcon(props: { class?: string }) {
    return (
        <svg
            class={props.class}
            width="10"
            height="10"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    );
}

function SpinnerIcon(props: { class?: string }) {
    return (
        <svg class={`animate-spin ${props.class ?? ""}`} width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}