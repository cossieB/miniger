import { state } from "../state";


export function BottomBar() {
    return (
        <div class="w-full h-8 bg-orange-500 pl-5">
            {state.status.message}
        </div>
    );
}
