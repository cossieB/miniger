import { A, useLocation, useNavigate } from "@solidjs/router"
import { ChevronRight, House } from "../icons"
import { For, Show, createMemo } from "solid-js"
import titleCase from "../lib/titleCase"

export function Breadcrumbs() {
    const location = useLocation()
    const navigate = useNavigate()
    const segments = createMemo(() => location.pathname.split("/"))
    return (
        <ol class="h-full flex items-center" >
            <li><House onclick={() => navigate("/")} /> </li>
            <For each={segments()}>
                {(segment, i) =>
                    <>
                        <li>
                            <A href={segments().slice(0, i() + 1).map(encodeURI).join("/")}>
                                {titleCase(decodeURI(segment))}
                            </A>
                        </li>
                        <Show when={i() < segments().length - 1}>
                            <ChevronRight />
                        </Show>
                    </>
                }
            </For>
        </ol>
    )
}