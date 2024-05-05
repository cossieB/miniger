import { A } from "@solidjs/router";
import { JSX } from "solid-js/web/types/jsx.js";

export function Nav() {
    return (
        <nav class="top-0 left-0 h-full w-52 bg-slate-700 text-orange-50 shrink-0">
            <ul>
                <NavLink href="/movies">Movies </NavLink>
                <NavLink href="/actors">Actors </NavLink>
                <NavLink href="/genres">Genres </NavLink>
                <NavLink href="/studios">Studios </NavLink>
            </ul>
        </nav>
    )
}

function NavLink(props: JSX.HTMLAttributes<HTMLLIElement> & {href: string}) {
    return (
        <li class="hover:bg-orange-600 hover:pl-5 transition-all" > <A class="w-full h-12 flex items-center pl-2" href={props.href}> {props.children} </A>  </li>
    )
}