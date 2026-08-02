import clickOutside from "~/lib/clickOutside";
import { type Props } from "./ContextMenu";
import styles from "./ContextMenu.module.css"

false && clickOutside;

export function Menu(props: Props) {

    return (
        <div
            ref={props.ref}
            use:clickOutside={props.close}
            class={styles.menu}
            style={{
                left: props.pos.x + "px",
                top: props.pos.y + "px",
            }}
        >
            <ul>
                {props.children}
            </ul>
        </div>
    );
}
