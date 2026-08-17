import { state } from "~/state"
import { ParentNode } from "./ParentNode"
import { LinkNode } from "./LinkNode"
import { enc } from "~/utils/encodeDecode"
import { CameraIcon, DramaIcon, ExternalLink, FileQuestionMarkIcon, FilmIcon, SearchIcon, TagIcon } from "lucide-solid"
import { createAsync } from "@solidjs/router"
import { For, Suspense } from "solid-js"
import styles from "~/layouts/main-window/MainWindow.module.css"
import { getTags } from "~/features/tags/api"
import { getStudios } from "~/features/studios/api"

export function Nav() {
    const tags = createAsync(() => getTags())
    const studios = createAsync(() => getStudios())
    return (
        <nav
            class={`${styles.tree} scrollable`}
            style={{ 
                width: state.tree.width + "px",
            }}
        >
            <ul id="tree-root">
                <ParentNode label="Movies">
                    <LinkNode label="All Movies" href="/movies" icon={<FilmIcon />} />
                    <LinkNode label="Inaccessible" href="/movies/inaccessible" icon={<FileQuestionMarkIcon />} />
                    <ParentNode label="Tags">
                        <Suspense>
                            <For each={tags.latest}>
                                {tag =>
                                    <LinkNode
                                        label={tag.tag}
                                        href={`/movies/tags/${tag.tag}`}
                                        icon={<TagIcon />}
                                    />}
                            </For>
                        </Suspense>
                    </ParentNode>

                    <ParentNode label="Studios">
                        <Suspense>
                            <For each={studios.latest}>
                                {studio =>
                                    <LinkNode
                                        label={studio.name}
                                        href={`/movies/studios/${enc({ display: studio.name, id: studio.studioId! })}`}
                                        icon={<CameraIcon />}
                                    />}
                            </For>
                        </Suspense>
                    </ParentNode>
                </ParentNode>
                <LinkNode label="Actors" href="/actors" icon={<DramaIcon />} />
                <LinkNode label="Studios" href="/studios" icon={<CameraIcon />} />
                <LinkNode label="Search" href="/search" icon={<SearchIcon />} />
                <LinkNode label="TMDB" href="/tmdb/movies" icon={<ExternalLink />} />
            </ul>
        </nav>
    )
}

