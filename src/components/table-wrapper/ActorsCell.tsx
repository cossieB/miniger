import { LoaderIcon } from "lucide-solid";
import { createSignal, For, onCleanup, Show } from "solid-js";
import { TABLE_CELL_HEIGHT } from "~/constants";
import type { TActor } from "~/datatypes";
import { useCellContext } from "~/utils/createTable";
import { ActorSelector } from "../CellEditors/ActorCellEditor/ActorSelector";
import styles from "./TagsCell.module.css"
import { ActorItem } from "../CellEditors/ActorCellEditor/ActorItem";
import { Portal } from "solid-js/web";

type Props = {
    onUpdate: (actors: TActor[]) => Promise<void>
}

export function ActorsCell(props: Props) {
    const cell = useCellContext<TActor[]>();
    const [edit, setEdit] = createSignal(false);
    const [loading, setLoading] = createSignal(false);
    const [oldValue, setOldValue] = createSignal(cell.getValue())
    const [showTooltip, setShowtooltip] = createSignal(false)
    let timer = -1
    onCleanup(() => clearTimeout(timer))
    const save = async (actors: TActor[]) => {
        try {
            setLoading(true)
            await props.onUpdate(actors)
            setOldValue(actors)
        } catch (error) {

        }
        finally {
            setLoading(false)
        }
    }
    const anchorName = "--cast-cell" + cell.id
    return (
        <div
            class={styles.cellWrapper}
            classList={{ [styles.overflowHidden]: !edit() }}
            style={{
                width: `${cell.column.getSize()}px`,
                height: `${TABLE_CELL_HEIGHT}px`,
                "anchor-name": anchorName,
            }}
            onMouseEnter={e => {
                timer = setTimeout(() => setShowtooltip(true), 1000)
            }}
            onMouseLeave={e => {
                clearTimeout(timer);
                setShowtooltip(false)
            }}
        >
            <Show when={edit()}
                fallback={
                    <button
                        type="button"
                        class={styles.triggerButton}
                        classList={{ [styles.isLoading]: loading() }}
                        onDblClick={() => {
                            setShowtooltip(false)
                            setEdit(true);
                        }}
                        title="Double click to edit"
                    >
                        <div class={styles.tagContainer}>
                            <For each={oldValue().slice(0, 3)}>
                                {actor => (
                                    <span class={styles.tagPill}>
                                        {actor.name}
                                    </span>
                                )}
                            </For>
                            <Show when={oldValue().length > 3}>
                                <span class={styles.tagPill}>
                                    +{oldValue().length - 3}
                                </span>
                            </Show>
                        </div>
                        <Show when={loading()}>
                            <LoaderIcon />
                        </Show>
                    </button>
                }
            >
                <ActorSelector
                    allowAddActor
                    close={() => { setEdit(false) }}
                    initialActors={oldValue()}
                    handleSubmit={async actors => {
                        await save(actors)
                        setEdit(false)
                    }}
                />
            </Show>
            <Show when={showTooltip()}>
                <Portal>
                    <Tooltip anchorName={anchorName} actors={oldValue()} />
                </Portal>
            </Show>
        </div>
    )
}

function Tooltip(props: { actors: TActor[], anchorName: string }) {
    
    return (
        <ul
            class={styles.tooltip}
            style={{
                "position-anchor": props.anchorName
            }}
        >
            <For each={props.actors}>
                {actor => <ActorItem actor={actor} />}
            </For>
        </ul>
    )
}