import { A, useLocation, useNavigate } from "@solidjs/router"
import { type Accessor, For, Show, createMemo } from "solid-js"
import titleCase from "../lib/titleCase"
import { deco } from "~/utils/encodeDecode"
import { ChevronRightIcon, HouseIcon } from "lucide-solid"

export function Breadcrumbs() {
    const location = useLocation()
    const navigate = useNavigate()
    const segments = createMemo(() => {
        if (location.pathname === "/")
            return []
        return location.pathname.split("/")
    })
    
    return (
        <ol class="h-full flex items-center" >
            <li>
                <HouseIcon onclick={() => navigate("/")} />
            </li>
            <For each={segments()}>
                {(segment, i) => <Crumb segment={segment} i={i} segments={segments}/>}
            </For>
        </ol>
    )
}

type P = {
    segments: Accessor<string[]>
    segment: string,
    i: Accessor<number>
}

function Crumb(props: P) {
    const segment = deco(props.segment)
    const display = typeof segment === "string" ? segment : segment.display
    return (
        <>
            <li>
                <A href={props.segments().slice(0, props.i() + 1).map(encodeURI).join("/")} >
                    {titleCase(display)}
                </A>
            </li>
            <Show when={props.i() < props.segments().length - 1}>
                <ChevronRightIcon />
            </Show>
        </>
    )
}
