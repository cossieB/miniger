import { useAction } from "@solidjs/router";
import { Accessor, Setter, Show } from "solid-js";
import { CreateActorSvg } from "../../../icons";
import { Actor } from "../../../datatypes";
import { setAddedActors } from "./ActorSelector";
import { addActor } from "../../../api/actions";

type Props = {
    input: Accessor<string>;
    setRowActors: Setter<Actor[]>;
};
export function AddActorToDatabaseBtn(props: Props) {
    const addActorAction = useAction(addActor);
    return (
        <Show when={props.input().length > 0}>
            <button
                onclick={async () => {
                    const actor = (await addActorAction(props.input().trim()));
                    if (!actor) return;
                    setAddedActors(prev => [...prev, actor]);
                    props.setRowActors(prev => [...prev, actor]);
                }}
            >
                <li class="flex items-center">
                    <CreateActorSvg />
                    Add {props.input()} to database
                </li>
            </button>
        </Show>
    );
}
