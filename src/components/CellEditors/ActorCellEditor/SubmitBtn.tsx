import { Accessor } from "solid-js";
import { Actor } from "../../../datatypes";
import { editFilmActors } from "../../../api/mutations";

type Props = {
    rowActors: Accessor<Actor[]>;
    film_id: string;
    stopEditing(): void;
};
export function SubmitBtn(props: Props) {
    return (
        <button class="flex h-10 w-full items-center justify-center bg-green-600"
            onclick={() => {
                editFilmActors(props.rowActors(), props.film_id);
                props.stopEditing();
            }}
        >
            SUBMIT
        </button>
    );
}