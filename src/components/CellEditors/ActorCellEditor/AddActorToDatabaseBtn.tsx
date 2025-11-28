import { type Accessor, type Setter, Show } from "solid-js";
import type { TActor } from "~/datatypes";
import { addActor } from "~/api/mutations";
import { useAction } from "@solidjs/router";
import { HoldClickBtn } from "~/components/HoldClickBtn";

type Props = {
    input: Accessor<string>;
    setRowActors: Setter<TActor[]>;
    clearInput: () => void;
};

export function AddActorToDatabaseBtn(props: Props) {

    const addActorAction = useAction(addActor)

    const newActor = async () => {
        const actorId = await addActorAction(props.input().trim());
        const actor: TActor = {
            actorId: actorId,
            dob: null,
            gender: null,
            image: null,
            name: props.input().trim(),
            nationality: null,
        };
        props.setRowActors(prev => [...prev, actor]);
    };

    return (
        <Show when={props.input().length > 0}>
            <HoldClickBtn
                action={newActor}
                clearInput={props.clearInput}
                input={props.input}
            />
        </Show>
    );
}