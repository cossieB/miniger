import { useNavigate } from "@solidjs/router";
import { BackArrowSvg, ForwardArrowSvg } from "~/icons";

export function BackBtn() {
    const navigate = useNavigate();
    return (
        <button
            title="Back"
            onclick={() => navigate(-1)}
        >
            <BackArrowSvg />
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
            <ForwardArrowSvg />
        </button>
    )
}