import { DialogForm } from "~/components/dialog/DialogForm";
import { state } from "~/state";
import type { FilmDialog } from "~/state/dialog";
import { editFilm, getFilm } from "../api";
import { createAsync, useAction, useSubmission } from "@solidjs/router";
import { createEffect, createSignal, For, Show, Suspense } from "solid-js";
import { MyLoader } from "~/components/MyLoader";
import { getStudios } from "~/features/studios/api";
import { getTags } from "~/features/tags/api";
import { createStore } from "solid-js/store";
import type { TActor } from "~/datatypes";
import { Tags } from "~/components/tables/TagsCell";
import { TagsDisplay } from "./TagsDisplay";
import { ActorSelector } from "~/features/actors/components/ActorSelector";

type Props = {
    dialog: HTMLDialogElement
}

export function MovieForm(props: Props) {
    const dialog = () => state.dialog.active
    const data = createAsync(() => getFilm((dialog() as FilmDialog).data.filmId))
    const studios = createAsync(() => getStudios(), { initialValue: [] })
    const tags = createAsync(() => getTags(), { initialValue: [] })
    const editAction = useAction(editFilm)
    const [showActors, setShowActors] = createSignal(false)
    const submission = useSubmission(editFilm)
    const [film, setFilm] = createStore({
        title: data()?.title ?? "",
        studioId: data()?.studioId ?? null,
        actors: data() ? JSON.parse(data()?.actors!) as TActor[] : [],
        tags: data() ? JSON.parse(data()?.tags!) as string[] : [],
        releaseDate: data()?.releaseDate,
    })

    createEffect(() => {
        const d = data();
        if (d) setFilm({
            title: d?.title,
            studioId: d?.studioId ?? null,
            actors: d ? JSON.parse(d?.actors!) as TActor[] : [],
            tags: d ? JSON.parse(d?.tags!) as string[] : [],
            releaseDate: d?.releaseDate,
        })
    })

    return (
        <Suspense fallback={<MyLoader />} >
            <DialogForm
                pending={!!submission.pending}
                onSubmit={async e => {
                    e.preventDefault();
                    const { actors, ...rest } = film;
                    await editAction({
                        filmId: data()!.filmId,
                        actorIds: film.actors.map(actor => actor.actorId),
                        ...rest
                    })
                    state.dialog.close()
                }}
            >
                <h1> Edit Film </h1>
                <input
                    type="text"
                    name="title"
                    placeholder="title"
                    value={film.title}
                    onChange={e => setFilm({
                        title: e.currentTarget.value
                    })}
                    required
                />
                <div style={{ "justify-content": "space-between" }} data-for="form-group">
                    <select
                        onChange={e => setFilm({
                            studioId: Number(e.currentTarget.value) || null
                        })}
                        name="studio_id"
                    >
                        <option selected={!film.studioId} value="">Studio</option>
                        <For each={studios()}>
                            {studio =>
                                <option value={studio.studioId} selected={film.studioId == studio.studioId} >{studio.name}</option>
                            }
                        </For>
                    </select>
                    <label class="flexCenter">
                        Released: &nbsp;
                        <input
                            value={film.releaseDate ?? undefined}
                            type="date"
                            onChange={e => setFilm({ releaseDate: e.currentTarget.value ?? null })}
                        />
                    </label>
                </div>
                <div>
                    <button
                        onClick={() => {
                            props.dialog.close()
                            setShowActors(true)
                        }}
                        class="btn"
                        type="button"
                    >
                        Select Actors
                    </button>
                    <span>
                        {new Intl.ListFormat(undefined, { type: 'conjunction' }).format(film.actors.map(a => a.name))}
                    </span>
                </div>
                <TagsDisplay
                    tags={film.tags}
                    onRemove={(tag) => setFilm('tags', tags => tags.filter(t => t != tag))}
                />
                <Tags
                    onClick={tag => {
                        setFilm('tags', prev => [...prev, tag])
                    }}
                    tags={tags().filter(t => !film.tags.includes(t.tag)).map(t => t.tag)}
                />
            </DialogForm>
            <Show when={showActors()}>
                <ActorSelector
                    close={() => {
                        setShowActors(false);
                        props.dialog.showModal()
                    }}
                    handleSubmit={actors => {
                        props.dialog.showModal()
                        setFilm({ actors })
                        setShowActors(false)
                    }}
                    initialActors={film.actors}
                    allowAddActor
                />
            </Show>
        </Suspense>
    )
}