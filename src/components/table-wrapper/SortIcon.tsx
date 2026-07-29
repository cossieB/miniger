import { Show } from "solid-js";

export function SortIcon(props: {
    direction: false | "asc" | "desc";
    sortable: boolean;
}) {
    return (
        <Show when={props.sortable}>
            <span class="inline-flex w-3 flex-col leading-none text-[8px]">
                <span
                    class={
                        props.direction === "asc"
                            ? "text-amber-400"
                            : "text-zinc-600"
                    }
                >
                    ▲
                </span>
                <span
                    class={
                        props.direction === "desc"
                            ? "text-amber-400"
                            : "text-zinc-600"
                    }
                >
                    ▼
                </span>
            </span>
        </Show>
    );
}