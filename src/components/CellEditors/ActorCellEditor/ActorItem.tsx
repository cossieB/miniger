import { Accessor, createResource, Setter, Suspense } from "solid-js";
import { Actor } from "../../../datatypes";
import { appDataDir, sep } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";

type Props = {
    actor: Actor;
    rowActors: Accessor<Actor[]>;
    setRowActors: Setter<Actor[]>;
};

const [dir] = createResource(async () => {
    const d = await appDataDir()
    return d + sep() + "images" + sep()
})

export function ActorItem(props: Props) {

    function handleClick() {
        if (props.rowActors().some(x => x.actor_id === props.actor.actor_id))
            props.setRowActors(prev => prev.filter(x => x.actor_id !== props.actor.actor_id));

        else
            props.setRowActors(prev => [...prev, props.actor]);
    }
    return (
        <Suspense fallback={"loading"}>
            <li
                onclick={handleClick}
                class="overflow-hidden h-60 flex flex-col"
                classList={{ 'border-2 border-green-500': props.rowActors().some((x: any) => x.actor_id === props.actor.actor_id) }}
            >
                <div class="h-[90%] overflow-hidden">
                    <img src={props.actor.image ? convertFileSrc(dir()! + props.actor.image) : "/Question_Mark.svg"} class="object-cover object-top h-full w-full" loading="lazy" alt="" onerror={e => e.currentTarget.src = "/Question_Mark.svg"} />
                </div>
                <span class="flex-1 flex items-center justify-center">{props.actor.name}</span>
            </li>
        </Suspense>
    );
}

export function ActorItem2(props: { actor: Actor }) {

    return (
        <Suspense>
            <li                
                class="overflow-hidden h-60 flex flex-col bg-slate-800 p-2"
            >
                <div class="h-[90%] overflow-hidden">
                    <img src={props.actor.image ? convertFileSrc(dir()! + props.actor.image) : "/Question_Mark.svg"} class="object-cover object-top h-full w-full" loading="lazy" alt="" onerror={e => e.currentTarget.src = "/Question_Mark.svg"} />
                </div>
                <span class="flex-1 flex items-center justify-center">{props.actor.name}</span>
            </li>
        </Suspense>
    )
}