import { Accessor, Setter, Show } from "solid-js";
import { CirclePlusSvg } from "../../../icons";
import { Actor } from "../../../datatypes";
import { setAddedActors } from "./ActorSelector";
import { addActor } from "../../../api/mutations";

type Props = {
    input: Accessor<string>;
    setRowActors: Setter<Actor[]>;
};
export function AddActorToDatabaseBtn(props: Props) {

    return (
        <Show when={props.input().length > 0}>
            <button
                onclick={async () => {
                    const actor = (await addActor(props.input().trim()));
                    if (!actor) return;
                    setAddedActors(prev => [...prev, actor]);
                    props.setRowActors(prev => [...prev, actor]);
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
