import { createAsync } from "@solidjs/router";
import { splitProps, createSignal, createEffect, Show, For, type ComponentProps, createMemo } from "solid-js";
import { TABLE_CELL_HEIGHT } from "~/constants";
import clickOutside from "~/lib/clickOutside";
import { useCellContext } from "~/utils/createTable";
import styles from "./SelectCell.module.css";
import { ChevronDownIcon, Loader } from "lucide-solid";

false && clickOutside

export type SelectOption = { label: string; value: string } | string;

export type SelectCellProps = {
    options: SelectOption[];
    onUpdate: (val: string) => Promise<void>;
    initialValue?: string | number
} & Omit<ComponentProps<"select">, "onChange" | "onBlur">;

export function SelectCell(props: SelectCellProps) {
    const [local, selectProps] = splitProps(props, ["options", "onUpdate"]);

    const cell = useCellContext<string>();
    const [edit, setEdit] = createSignal(false);
    const [loading, setLoading] = createSignal(false);
    const [startingVal, setStartingVal] = createSignal(String(props.initialValue ?? ""))    
    const [value, setValue] = createSignal(String(props.initialValue ?? ""))

    let selectRef!: HTMLSelectElement;
    let isCancelled = false;

    const normalizedOptions = createMemo(() =>
        local.options.map(opt =>
            typeof opt === "string" ? { label: opt, value: opt } : opt
        )
    );

    const currentLabel = createMemo(() => {
        return normalizedOptions().find(opt => String(opt.value) === value())?.label;
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

        if (newValue === startingVal()) return
        try {
            setLoading(true);
            setValue(newValue)
            await local.onUpdate(newValue);
            setStartingVal(newValue)
        } 
        catch (error) {
            setValue(String(startingVal()))
            console.error("Failed to commit select cell update:", error);
        } 
        finally {
            setLoading(false);
        }

        setEdit(false);
    };

    return (
        <div
            class={styles.cellWrapper}
            style={{
                width: `${cell.column.getSize()}px`,
                height: `${TABLE_CELL_HEIGHT}px`
            }}
            use:clickOutside={() => {
                setEdit(false)
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
                        <span class={styles.triggerText}>
                            {currentLabel() || <span class={styles.emptyText}>Empty</span>}
                        </span>
                        <Show when={loading()} fallback={
                            <ChevronDownIcon class={styles.iconChevronHover} />
                        }>
                            <Loader class={styles.iconSpinner} />
                        </Show>
                    </button>
                }
            >
                <div class={styles.selectWrapper}>
                    <select
                        {...selectProps}
                        value={value()}
                        ref={selectRef}
                        disabled={loading() || selectProps.disabled}
                        class={`${styles.selectInput} ${selectProps.class || ""}`}
                        onChange={(e) => {
                            setValue(e.currentTarget.value)
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
                                    selected={String(option.value) === value()}
                                >
                                    {option.label}
                                </option>
                            )}
                        </For>
                    </select>
                    <ChevronDownIcon class={styles.iconChevronAbsolute} />
                </div>
            </Show>
        </div>
    );
}

type AsyncSelectCellProps<T> = {
    getOptions: () => Promise<T[]>;
    normalize: (item: T) => { label: string; value: string };
    onUpdate: (val: string) => Promise<void>;
    initialValue?: string | number
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
            initialValue={props.initialValue}
            {...selectProps}
        />
    );
}

