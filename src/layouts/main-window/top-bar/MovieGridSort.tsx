import { useLocation } from "@solidjs/router"
import { FunnelIcon } from "lucide-solid"
import { Show } from "solid-js"
import { activeView } from "./ViewToggle"
import { appliedFilters } from "~/features/movies/contexts/MovieGridContext"

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
                <FunnelIcon classList={{"animate-spin": Object.values(appliedFilters).flat().length > 0}} />
            </button>
        </Show>
    )
}
