import { createAsync } from "@solidjs/router"
import { For } from "solid-js"
import { getStudios, getTags } from "../../api/data"
import { state } from "../../state"
import { CameraSvg, FilmstripSvg, GearSvg, QuestionMarkSvg, TagSvg, TheatreSvg } from "~/icons"
import { ButtonNode } from "./ButtonNode"
import { ParentNode } from "./ParentNode"
import { LinkNode } from "./LinkNode"

export function Nav() {
    const tags = createAsync(() => getTags(), { initialValue: [] })
    const studios = createAsync(() => getStudios(), { initialValue: [] })
    return (
        <nav
            class="top-0 left-0 h-full bg-slate-950 text-orange-50 shrink-0 overflow-y-auto text-sm"
            style={{ width: state.tree.width + "px" }}
        >
            <ul id="tree-root">
                <ParentNode label="Movies">
                    <LinkNode label="All Movies" href="/movies" icon={<FilmstripSvg />} />
                    <LinkNode label="Inaccessible" href="/movies/inaccessible" icon={<QuestionMarkSvg />} />
                    <ParentNode label="Tags" >
                        <For each={tags()}>
                            {tag => <LinkNode label={tag.tag} href={`/movies/tags/${tag.tag}`} icon={<TagSvg />} />}
                        </For>
                    </ParentNode>
                    <ParentNode label="Studios">
                        <For each={studios()}>
                            {studio => <LinkNode label={studio.name} href={`/movies/studios/${studio.studio_id}`} icon={<CameraSvg />} />}
                        </For>
                    </ParentNode>
                </ParentNode>
                <LinkNode label="Actors" href="/actors" icon={<TheatreSvg />} />
                <LinkNode label="Studios" href="/studios" icon={<CameraSvg />} />
                <ButtonNode
                    label="Settings"
                    icon={<GearSvg />}
                    onclick={() => {

                    }}
                />
            </ul>
        </nav>
    )
}





