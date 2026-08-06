import { For } from "solid-js";
import { useMovieGridContext } from "../hooks/useMovieGridContext"
import styles from "./MovieGrid.module.css"
import { appliedFilters, setAppliedFilters } from "../contexts/MovieGridContext";

export function FilterWrapper() {
    const { facets } = useMovieGridContext();

    return (
        <>
            <div class={styles.facet +" scrollable"}>
                <h3>Actors</h3>
                <For each={facets().actors}>
                    {actor => (
                        <div
                            classList={{[styles.active]: appliedFilters.actorIds?.includes(actor.id)}}
                            onClick={e => {
                                const arr = appliedFilters.actorIds;
                                if (!arr) return setAppliedFilters({
                                    actorIds: [actor.id]
                                })
                                if (arr.includes(actor.id)) return setAppliedFilters('actorIds', arr!.filter(id => id !== actor.id))
                                return setAppliedFilters('actorIds', [...arr, actor.id])
                            }}
                        >
                            <label> {actor.name} </label>
                            <span> {actor.count} </span>
                        </div>
                    )}
                </For>
            </div>
            <div class={styles.facet +" scrollable"}>
                <h3>Tags</h3>
                <For each={facets().tags}>
                    {tag => (
                        <div
                            classList={{[styles.active]: appliedFilters.tags?.includes(tag.tag)}}
                            onClick={e => {
                                const arr = appliedFilters.tags;
                                if (!arr) return setAppliedFilters({
                                    tags: [tag.tag]
                                })
                                if (arr.includes(tag.tag)) return setAppliedFilters('tags', arr!.filter(t => t !== tag.tag))
                                return setAppliedFilters('tags', [...arr, tag.tag])
                            }}
                        >
                            <label> {tag.tag} </label>
                            <span> {tag.count} </span>
                        </div>
                    )}
                </For>
            </div>
            <div class={styles.facet +" scrollable"}>
                <h3>Studios</h3>
                <For each={facets().studios}>
                    {studio => (
                        <div
                            classList={{[styles.active]: appliedFilters.studioIds?.includes(studio.id)}}
                            onClick={e => {
                                const arr = appliedFilters.studioIds;
                                if (!arr) return setAppliedFilters({
                                    studioIds: [studio.id]
                                })
                                if (arr.includes(studio.id)) return setAppliedFilters('studioIds', arr!.filter(id => id !== studio.id))
                                return setAppliedFilters('studioIds', [...arr, studio.id])
                            }}
                        >
                            <label> {studio.name} </label>
                            <span> {studio.count} </span>
                        </div>
                    )}
                </For>
            </div>            
            <div class={styles.facet +" scrollable"}>
                <h3>Codecs</h3>
                <For each={facets().videoCodecs}>
                    {codec => (
                        <div
                            classList={{[styles.active]: appliedFilters.videoCodecs?.includes(codec.codec)}}
                            onClick={e => {
                                const arr = appliedFilters.videoCodecs;
                                if (!arr) return setAppliedFilters({
                                    videoCodecs: [codec.codec]
                                })
                                if (arr.includes(codec.codec)) return setAppliedFilters('videoCodecs', arr!.filter(t => t !== codec.codec))
                                return setAppliedFilters('videoCodecs', [...arr, codec.codec])
                            }}
                        >
                            <label> {codec.codec} </label>
                            <span> {codec.count} </span>
                        </div>
                    )}
                </For>
            </div>            
        </>
    )
}