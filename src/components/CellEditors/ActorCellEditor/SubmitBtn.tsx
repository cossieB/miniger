import { Accessor } from "solid-js";
import { Actor } from "../../../datatypes";
import { editFilmActors } from "../../../api/mutations";
import { useAction } from "@solidjs/router";

type Props = {
    rowActors: Accessor<Actor[]>;
    filmId: string;
    stopEditing(): void;
};
export function SubmitBtn(props: Props) {
    const editFilmActorsAction = useAction(editFilmActors);
    return (
        <button class="flex p-3 w-full items-center justify-center bg-green-600"
            onclick={() => {
                editFilmActorsAction(props.rowActors(), props.filmId);
                props.stopEditing();
            }}
        >
            SUBMIT
        </button>
    );
}