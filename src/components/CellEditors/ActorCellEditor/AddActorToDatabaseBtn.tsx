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
                    const actor = await addActorAction(props.input().trim());
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
