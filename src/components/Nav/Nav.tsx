import { getStudios, getTags } from "../../api/data"
import { state } from "../../state"
import { CameraSvg, FilmstripSvg, QuestionMarkSvg, SearchSvg, TagSvg, TheatreSvg } from "~/icons"
import { AsyncParentNode, ParentNode } from "./ParentNode"
import { LinkNode } from "./LinkNode"
import { enc } from "~/utils/encodeDecode"

export function Nav() {

    return (
        <nav
            class="top-0 left-0 h-full bg-slate-950 text-orange-50 shrink-0 overflow-y-auto text-sm"
            style={{ width: state.tree.width + "px" }}
        >
            <ul id="tree-root">
                <ParentNode label="Movies">
                    <LinkNode label="All Movies" href="/movies" icon={<FilmstripSvg />} />
                    <LinkNode label="Inaccessible" href="/movies/inaccessible" icon={<QuestionMarkSvg />} />
                    <AsyncParentNode label="Tags" fetcher={() => getTags()} >
                        {tag =>
                            <LinkNode
                                label={tag.tag}
                                href={`/movies/tags/${tag.tag}`}
                                icon={<TagSvg />}
                            />}
                    </AsyncParentNode>
                    <AsyncParentNode label="Studios" fetcher={() => getStudios()}>
                        {studio =>
                            <LinkNode
                                label={studio.name}
                                href={`/movies/studios/${enc({display:studio.name!, id: studio.studioId!})}`}
                                icon={<CameraSvg />}
                            />}
                    </AsyncParentNode>
                </ParentNode>
                <LinkNode label="Actors" href="/actors" icon={<TheatreSvg />} />
                <LinkNode label="Studios" href="/studios" icon={<CameraSvg />} />
                <LinkNode label="Search" href="/search" icon={<SearchSvg />} />
            </ul>
        </nav>
    )
}
