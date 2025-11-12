import { Accessor, Setter, Show } from "solid-js";
import { CirclePlusSvg } from "../../../icons";
import { TActor } from "../../../datatypes";
import { addActor } from "../../../api/mutations";
import { useAction } from "@solidjs/router";

type Props = {
    input: Accessor<string>;
    setRowActors: Setter<TActor[]>;
    clearInput: () => void;
};
export function AddActorToDatabaseBtn(props: Props) {
    const addActorAction = useAction(addActor)
    return (
        <Show when={props.input().length > 0}>
            <button
                class="w-full p-3 bg-orange-500"
                onclick={async () => {
                    const actorId = await addActorAction(props.input().trim());
                    const actor: TActor = {
                        actorId: actorId,
                        dob: null,
                        gender: null,
                        image: null,
                        name: props.input().trim(),
                        nationality: null,
                    }
                    props.setRowActors(prev => [...prev, actor])
                    props.clearInput()
                }}
            >
                <li class="flex items-center w-full justify-center">
                    <CirclePlusSvg />&nbsp;
                    Add<span class="font-bold italic">&nbsp;{props.input()}&nbsp;</span>to database
                </li>
            </button>
        </Show>
    );
}
