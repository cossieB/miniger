import { useNavigate } from "@solidjs/router";
import { CircleArrowLeftIcon, CircleArrowRightIcon } from "lucide-solid";

export function BackBtn() {
    const navigate = useNavigate();
    return (
        <button
            title="Back"
            onclick={() => navigate(-1)}
        >
            <CircleArrowLeftIcon />
        </button>
    )
}

export function ForwardBtn() {
    const navigate = useNavigate()
    return (
        <button
            title="Forward"
            onclick={() => navigate(1)}
        >
            <CircleArrowRightIcon />
        </button>
    )
}