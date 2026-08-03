import { createStore } from "solid-js/store";

export const [dialog, setDialog] = createStore({
    active: null as null | ActorDialog | StudioDialog | FilmDialog,
    openDialog: (active: NonNullable<typeof dialog['active']>) => setDialog({active}),
    close: () => setDialog({active: null})
})

export type ActorDialog = {
    type: "actor",
    data?: {
        actorId: number
    }
}

export type StudioDialog = {
    type: "studio",
    data?: {
        studioId: number
    }
}

export type FilmDialog = {
    type: "film",
    data: {
        filmId: number
    }
}