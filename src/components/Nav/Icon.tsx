import { JSX } from "solid-js";

export function Icon(props: JSX.HTMLAttributes<HTMLSpanElement>) {
    return (
        <span class="w-4 mx-1 flex items-center justify-center" {...props}>
            {props.children}
        </span>
    );
}
