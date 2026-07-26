export function SortIcon(props: {
    direction: false | "asc" | "desc";
    sortable: boolean;
}) {
    if (!props.sortable) return null;
    return (
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
    );
}