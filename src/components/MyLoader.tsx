import { LoaderCircleIcon } from "lucide-solid";

export function MyLoader() {
    return (
        <div class="flexCenter fillUp">
            <LoaderCircleIcon class="animate-spin" size={25} />
        </div>
    )
}