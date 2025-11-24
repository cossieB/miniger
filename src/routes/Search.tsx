import { JSXElement, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { ActorSelector } from "~/components/CellEditors/ActorCellEditor/ActorSelector";
import { TagSelector } from "~/components/TagSelector";
import { TActor } from "~/datatypes";
import { useNavigate } from "@solidjs/router";
import { StudioSelector } from "~/components/CellEditors/StudioSelector/StudioSelector";
import { CaretIcon } from "~/components/CaretIcon";

const [filters, setFilters] = createStore({
    actors: [] as TActor[],
    tags: [] as string[],
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
    showStudios: false
})

export function Search(props: { children?: JSXElement }) {
    const navigate = useNavigate()

    function handleClick() {
        sessionStorage.setItem("filters", JSON.stringify(filters))

        navigate("/movies/search")
    }
    return (
        <div class="ctis p-5 h-full overflow-auto thin-scrollbar">
            <h1 class="text-center text-3xl">Search Movies</h1>
            <div>
                <h2 class="font-bold">Actors</h2>
                <button
                    class="bg-amber-500 p-1"
                    onclick={() => setState({ showActors: true })}
                >
                    Select Actors

                </button>
                <span class="ml-2">{new Intl.ListFormat(undefined, { type: 'conjunction' }).format(filters.actors.map(a => a.name))}</span>
            </div>
            <h2 class="py-2">Tags</h2>
            <span class="h-10 bg-slate-700 mt-1 mb-3 px-1 flex items-center">
                {filters.tags.join(", ")}
            </span>
            <TagSelector
                selectedTags={filters.tags}
                setTags={tags => setFilters({ tags })}

            />
            <div class="flex justify-around my-5">
                <label >
                    Released After
                    <input type="date" class="ml-5" value={filters.afterDate} onchange={(e) => setFilters("afterDate", e.target.value)} />
                </label>
                <label >
                    Released Before
                    <input type="date" class="ml-5" value={filters.beforeDate} onchange={(e) => setFilters("beforeDate", e.target.value)} />
                </label>
            </div>
            <button
                class="bg-amber-500 p-1 flex text-nowrap items-center [&>svg]:h-5"
                onclick={() => setState("showStudios", prev => !prev)}
            >
                Select Studio &nbsp;
                <CaretIcon isOpen={() => state.showStudios} />
            </button>
            <span> {filters.studio.name == "Unknown" ? "" : filters.studio.name} </span>
            <div
                class="mt-5 z-500 overflow-hidden transition-[height_2s_ease] "
                classList={{ "h-auto!": state.showStudios, "h-0": !state.showStudios }}
            >
                <StudioSelector
                    setSelectedStudio={studio => {
                        setFilters("studio", studio)
                        setState("showStudios", false)
                    }}
                />
            </div>

            <Show when={state.showActors}>
                <ActorSelector
                    allowAddActor={false}
                    close={() => {
                        setState({ showActors: false })
                    }}
                    handleSubmit={(actors) => {
                        setState({ showActors: false })
                        setFilters({ actors })
                    }}
                    initialActors={filters.actors}
                />
            </Show>

            <button
                class="flex p-3 w-full items-center justify-center bg-green-600 mt-5 disabled:bg-green-200 disabled:text-black"
                onclick={handleClick}
                disabled={(filters.actors.length + filters.tags.length === 0) && !filters.studio.studioId}
            >
                SEARCH
            </button>
        </div>
    )
}
