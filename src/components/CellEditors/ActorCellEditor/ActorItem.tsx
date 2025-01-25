import { Accessor, Setter } from "solid-js";
import { Actor } from "../../../datatypes";

type Props = {
    actor: Actor;
    rowActors: Accessor<Actor[]>;
    setRowActors: Setter<Actor[]>;
};
export function ActorItem(props: Props) {

    function handleClick() {
        if (props.rowActors().some(x => x.actor_id === props.actor.actor_id))
            props.setRowActors(prev => prev.filter(x => x.actor_id !== props.actor.actor_id));

        else
            props.setRowActors(prev => [...prev, props.actor]);
    }
    return (
        <li
        onclick={handleClick}
        class="overflow-hidden h-60 flex flex-col"
        classList={{ 'border-2 border-green-500': props.rowActors().some((x: any) => x.actor_id === props.actor.actor_id) }}
    >
        <div class="h-[90%] overflow-hidden">
            <img src={props.actor.image ?? "/Question_Mark.svg"} class="object-cover object-top h-full w-full" loading="lazy" alt="" />
        </div>
        <span class="flex-1 flex items-center justify-center">{props.actor.name}</span>
    </li>
    );
}
