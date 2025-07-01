import { A, useLocation, useNavigate, useSearchParams } from "@solidjs/router"
import { ChevronRight, HouseSvg } from "../icons"
import { Accessor, For, Show, createMemo } from "solid-js"
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
    const url = () => getUrl(location, props, search)
    return (
        <>
            <li>
                <A href={url().toString()} >
                    {titleCase(decodeURI(search[props.segment] as string | undefined ?? props.segment))}
                </A>
            </li>
            <Show when={props.i() < props.segments().length - 1}>
                <ChevronRight />
            </Show>
        </>
    )
}
function getUrl(location: ReturnType<typeof useLocation>, props: P, search: ReturnType<typeof useSearchParams>[0]) {
    const url = new URL("http://localhost:1420" + location.pathname)
    const temp = props.segments().slice(0, props.i() + 1).join("/")
    if (temp === "/movies/tags") {
        const s = new URLSearchParams(search as any)
        url.search = s.toString()
        return url
    }
    const s = new URLSearchParams({
        prev: location.pathname,
        ...search[props.segment] && ({
            [props.segment]: search[props.segment]
        })
    })
    url.search = s.toString()
    url.pathname = temp
    return url
}

