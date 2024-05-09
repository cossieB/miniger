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
            classList={{ 'border-2 border-green-500': props.rowActors().some((x: any) => x.actor_id === props.actor.actor_id) }}
        >
            <img src={props.actor.image ?? "/Question_Mark.svg"} class="h-100 aspect-square object-cover" loading="lazy" alt="" />
            {props.actor.name}
        </li>
    );
}
