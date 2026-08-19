import { action, json, query } from "@solidjs/router";
import type { TActor } from "~/datatypes";
import type { OptionalExcept } from "~/lib/utilityTypes";
import * as actorRepo from "~/repositories/actorsRepository"
import { state } from "~/state";
import { getId } from "~/utils/getIdFromParam";

export const getActors = query(async () => {
    return actorRepo.allActors()
}, 'actors')

export const addActor = action(async (partialActor: string | Omit<TActor, 'actorId'>, revalidate: string[] = [getActors.key]) => {
    const actorObj = typeof partialActor === "string" ? { name: partialActor, dob: null, gender: null, image: null, nationality: null, tmdbId: null } : partialActor;
    try {
        const a = await actorRepo.createActor(actorObj)
        return json(a, { revalidate })
    }
    catch (error) {
        console.error(error);
        state.status.setStatus(String(error))
        throw json(undefined, { revalidate: [] });
    }
})

export const editActor = action(async (a: OptionalExcept<TActor, 'actorId'>, revalidate: string[] = [getActor.keyFor(a.actorId), getActors.key]) => {
    const { actorId, ...rest } = a
    if (Object.keys(rest).length === 0) return;
    try {
        const a = await actorRepo.updateActor(rest, actorId as any as number)
        return json(a, { revalidate })
    }
    catch (error) {
        console.error(error);
        state.status.setStatus(String(error))
        throw json(undefined, { revalidate: [] });
    }
})

export const getPairings = query(async (actor?: string) => {
    const actorId = actor ? getId(actor, "/costars") : undefined
    return actorRepo.getActorPairings(actorId)
}, 'pairings')

export const removeActors = action(async (actorIds: number[], revalidate: string[] = [getActors.key]) => {
    try {
        await actorRepo.deleteActors(actorIds)
        return json(undefined, { revalidate })
    }
    catch (error) {
        state.status.setStatus(String(error))
        throw json(undefined, { revalidate: [] })
    }
})

export const getActor = query(async (actorId: number) => {
    return actorRepo.findById(actorId)
}, "actor")