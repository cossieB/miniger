import { Accessor, Setter, Show } from "solid-js";
import { CirclePlusSvg } from "../../../icons";
import { Actor } from "../../../datatypes";
import { addActor } from "../../../api/mutations";
import { useAction } from "@solidjs/router";

type Props = {
    input: Accessor<string>;
    setRowActors: Setter<Actor[]>;
};
export function AddActorToDatabaseBtn(props: Props) {
    const addActorAction = useAction(addActor)
    return (
        <Show when={props.input().length > 0}>
            <button
                onclick={async () => {
                    const actorId = await addActorAction(props.input().trim());
                    const actor: Actor = {
                        actor_id: actorId,
                        dob: null,
                        gender: null,
                        image: null,
                        name: props.input().trim(),
                        nationality: null,
                    }
                    props.setRowActors(prev => [...prev, actor])
                }}
            >
                <li class="flex items-center">
                    <CirclePlusSvg />
                    Add {props.input()} to database
                </li>
            </button>
        </Show>
    );
}
