import { useNavigate } from "@solidjs/router";
import { BackArrow, ForwardArrow, House } from "../icons";

export function TopBar() {
    const navigate = useNavigate();
    return (
        <nav class="w-full h-8 bg-orange-500 flex pl-5 gap-5 [&>svg]:h-full text-orange-50">
            <House onclick={() => navigate("/")} />
            <BackArrow onclick={() => navigate(-1)} />
            <ForwardArrow onclick={() => navigate(1)} />

        </nav>
    );
}
