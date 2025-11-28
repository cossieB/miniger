import { A, useLocation, useNavigate, useSearchParams } from "@solidjs/router"
import { ChevronRight, HouseSvg } from "../icons"
import { type Accessor, For, Show, createMemo } from "solid-js"
import titleCase from "../lib/titleCase"

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
                <HouseSvg onclick={() => navigate("/")} />
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
    const location = useLocation()
    const [search] = useSearchParams()
    return (
        <>
            <li>
                <A href={props.segments().slice(0, props.i() + 1).map(encodeURI).join("/") + location.search} >
                    {titleCase(decodeURI(search[props.segment] as string | undefined ?? props.segment))}
                </A>
            </li>
            <Show when={props.i() < props.segments().length - 1}>
                <ChevronRight />
            </Show>
        </>
    )
}
