import { type Accessor, type Setter, Suspense } from "solid-js";
import type { TActor } from "../../../datatypes";
import { appDataDir, join, sep } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";
import styles from "./ActorSelector.module.css"

type Props = {
    actor: TActor;
} & ({
    rowActors: Accessor<TActor[]>;
    setRowActors: Setter<TActor[]>;
} | {
    rowActors?: undefined
    setRowActors?: undefined
})

const dir = await join(await appDataDir(), "images", "actors")

export function ActorItem(props: Props) {
    function handleClick() {
        if (!props.rowActors) return;
        if (props.rowActors().some(x => x.actorId === props.actor.actorId))
            props.setRowActors(prev => prev.filter(x => x.actorId !== props.actor.actorId));

        else
            props.setRowActors(prev => [...prev, props.actor]);
    }
    return (
        <Suspense fallback={"loading"}>
            <li
                onclick={handleClick}
                class={`${styles.actorItem}`}
                classList={{ [styles.selected]: props.rowActors?.().some(actor => actor.actorId === props.actor.actorId) }}
            >
                <div>
                    <img
                        src={convertFileSrc(dir + sep() + props.actor.actorId + ".webp") + `?n=${Date.now()}`}                        
                        loading="lazy"
                        alt=""
                        onerror={e => e.currentTarget.src = "/Question_Mark.svg"}
                    />
                </div>
                <span>{props.actor.name}</span>
            </li>
        </Suspense>
    );
}
