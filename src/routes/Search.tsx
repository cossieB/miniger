import { For, type JSXElement, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { ActorSelector } from "~/features/actors/components/ActorSelector";
import { type TActor } from "~/datatypes";
import { createAsync, useNavigate } from "@solidjs/router";
import { Tags } from "~/components/tables/TagsCell";
import { ReactiveSet } from "@solid-primitives/set";
import { XIcon } from "lucide-solid";
import styles from "./Search.module.css";
import { withViewTransition } from "~/utils/withViewTransition";
import { getTags } from "~/features/tags/api";
import { getStudios } from "~/features/studios/api";

const [filters, setFilters] = createStore({
    actors: [] as TActor[],
    tags: new ReactiveSet<string>(),
    afterDate: "",
    beforeDate: "",
    studio: {
        name: "",
        studioId: null as number | null
    }
})

export type Filters = typeof filters

const [state, setState] = createStore({
    showActors: false,
})

export function Search(props: { children?: JSXElement }) {
    const navigate = useNavigate()
    const tags = createAsync(() => getTags(), { initialValue: [] })
    const studios = createAsync(() => getStudios(), { initialValue: [] })
    function handleClick() {
        sessionStorage.setItem("filters", JSON.stringify({
            ...filters,
            tags: Array.from(filters.tags)
        }))
        navigate("/movies/search")
    }

    return (
        <div class={`scrollable ${styles.container}`}>
            <h1 class={styles.title}>Search Movies</h1>

            <div>
                <h2 class={styles.sectionTitle}>Actors</h2>
                <button
                    class={styles.actionButton}
                    onclick={() => setState({ showActors: true })}
                >
                    Select Actors
                </button>
                <span class={styles.actorNames}>
                    {new Intl.ListFormat(undefined, { type: 'conjunction' }).format(filters.actors.map(a => a.name))}
                </span>
            </div>

            <h2 class={styles.sectionTitle}>Tags</h2>
            <div class={styles.tagsDisplay}>
                <For each={Array.from(filters.tags)}>
                    {tag => (
                        <div style={{ "view-transition-name": `--tag-${tag}` }}>
                            <span>{tag}</span>
                            <button onClick={() => withViewTransition(() => setFilters('tags', filters => {
                                filters.delete(tag);
                                return filters
                            }))}>
                                <XIcon size={16} />
                            </button>
                        </div>
                    )}
                </For>
            </div>
            <Tags
                onClick={tag => withViewTransition(() => {
                    if (filters.tags.has(tag)) filters.tags.delete(tag)
                    else filters.tags.add(tag)
                })}
                tags={tags().filter(t => !filters.tags.has(t.tag)).map(t => t.tag)}
            />

            <div class={styles.dateGroup}>
                <select
                    onChange={e => {
                        setFilters('studio', JSON.parse(e.currentTarget.value))
                    }}
                >
                    <option value={JSON.stringify({name: "", studioId: null})}>
                        Studio

                    </option>
                    <For each={studios()}>
                        {studio => <option
                            value={JSON.stringify(studio)}
                            selected={filters.studio.studioId == studio.studioId}
                        >
                            {studio.name}
                        </option>}
                    </For>
                </select>
                <label>
                    Released After
                    <input
                        type="date"
                        value={filters.afterDate}
                        onchange={(e) => setFilters("afterDate", e.target.value)}
                    />
                </label>
                <label>
                    Released Before
                    <input
                        type="date"
                        value={filters.beforeDate}
                        onchange={(e) => setFilters("beforeDate", e.target.value)}
                    />
                </label>
            </div>



            <Show when={state.showActors}>
                <ActorSelector
                    allowAddActor={false}
                    close={() => setState({ showActors: false })}
                    handleSubmit={(actors) => {
                        setState({ showActors: false })
                        setFilters({ actors })
                    }}
                    initialActors={filters.actors}
                />
            </Show>

            <button
                class={styles.submitBtn}
                onclick={handleClick}
                disabled={(
                    filters.actors.length + filters.tags.size === 0) 
                    && !filters.studio.studioId
                    && !filters.beforeDate
                    && !filters.afterDate
                }
            >
                SEARCH
            </button>
        </div>
    )
}