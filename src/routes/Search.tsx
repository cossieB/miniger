import { JSXElement, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { ActorSelector } from "~/components/CellEditors/ActorCellEditor/ActorSelector";
import { TagSelector } from "~/components/TagSelector";
import { TActor } from "~/datatypes";
import { useNavigate } from "@solidjs/router";

const [state, setState] = createStore({
    actors: [] as TActor[],
    showActors: false,
    tags: [] as string[],
    afterDate: "",
    beforeDate: ""
})
export function Search(props: { children?: JSXElement }) {
    const navigate = useNavigate()
    
    function handleClick() {
        const searchParams = new URLSearchParams();
        for (const actor of state.actors)
            searchParams.append("actorIds", actor.actorId.toString())
        for (const tag of state.tags)
            searchParams.append("tags", tag)
        searchParams.append("afterDate", state.afterDate)
        searchParams.append("beforeDate", state.beforeDate)

        navigate("/movies/search?" + searchParams.toString())
    }
    return (
        <div class="ctis p-5">
            <h1 class="text-center text-3xl">Search Movies</h1>
            <div>
                <h2 class="font-bold">Actors</h2>
                <button class="bg-amber-500 p-1" onclick={() => setState({ showActors: true })} >Select Actors</button>
                <span class="ml-2">{new Intl.ListFormat(undefined, { type: 'conjunction' }).format(state.actors.map(a => a.name))}</span>
            </div>
            <h2 class="py-2">Tags</h2>
            <span class="h-10 bg-slate-700 mt-1 mb-3 px-1 flex items-center">
                {state.tags.join(", ")}
            </span>
            <TagSelector
                selectedTags={state.tags}
                setTags={tags => setState({ tags })}

            />
            <div class="flex justify-around my-5">
                <label >
                    Released After
                    <input type="date" class="ml-5" value={state.afterDate} onchange={(e) => setState("afterDate", e.target.value)} />
                </label>
                <label >
                    Released Before
                    <input type="date" class="ml-5" value={state.beforeDate} onchange={(e) => setState("beforeDate", e.target.value)} />
                </label>
            </div>

            

            <Show when={state.showActors}>
                <ActorSelector
                    allowAddActor={false}
                    close={() => {
                        setState({ showActors: false })
                    }}
                    getValue={() => []}
                    handleSubmit={(actors) => {
                        setState({ actors, showActors: false })
                    }}
                    initialActors={state.actors}
                />
            </Show>

            <button
                class="flex p-3 w-full items-center justify-center bg-green-600 mt-5 disabled:bg-green-200 disabled:text-black"
                onclick={handleClick}
                disabled={state.actors.length + state.tags.length === 0}
            >
                SEARCH
            </button>
        </div>
    )
}
