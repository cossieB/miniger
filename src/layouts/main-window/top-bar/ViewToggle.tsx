import { useLocation } from "@solidjs/router";
import { ListIcon, Grid3x3Icon } from "lucide-solid";
import { createSignal, Match, Switch } from "solid-js";

export const [activeView, setActiveView] = createSignal<"grid" | "table">("grid")

export function ViewToggle() {
    const location = useLocation()
    const match = () => /^\/movies(?!\/inaccessible)/.test(location.pathname)

    return (
        <Switch>
            <Match when={!match()}>
                {null}
            </Match>
            <Match when={activeView() == "grid"}>
                <ListIcon
                    onClick={() => setActiveView("table")}
                />
            </Match>
            <Match when={activeView() == "table"}>
                <Grid3x3Icon
                    onClick={() => setActiveView("grid")}
                />
            </Match>
        </Switch>
    )
}