import { useLocation } from "@solidjs/router"
import { FunnelIcon } from "lucide-solid"
import { Show } from "solid-js"
import { activeView } from "./ViewToggle"

export function MovieGridSortBtn() {
    const location = useLocation()
    const match = () => /^\/movies(?!\/inaccessible)/.test(location.pathname)
    return (
        <Show when={match() && activeView() == "grid"}>
            <button title="Filter Movies" style={{
                "anchor-name": "--movie-grid-sort-btn"
            }}
                popoverTarget="movie-grid-sort"
            >
                <FunnelIcon />
            </button>
        </Show>
    )
}
