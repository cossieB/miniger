import { action, json, query } from "@solidjs/router";
import type { TStudio } from "~/datatypes";
import type { OptionalExcept } from "~/lib/utilityTypes";
import { state } from "~/state";
import * as studioRepo from "~/repositories/studioRepository"

export const getStudios = query(async () => {
    return studioRepo.allStudios()
}, 'studios')

export const getStudio = query(async (studioId: number) => {
    return studioRepo.findStudioById(studioId)
}, "studio")

export const createStudio = action(async (studio: string | Omit<TStudio, "studioId">, revalidate: string[] = [getStudios.key]) => {
    const studioObj = typeof studio === "string" ?  {name: studio, website: null} : studio
    try {
        const s = await studioRepo.addStudio(studioObj);
        return json(s, {revalidate})
    }
    catch (error) {
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const updateStudio = action(async (s: OptionalExcept<TStudio, "studioId">, revalidate: string[] = [getStudios.key, getStudio.keyFor(s.studioId)]) => {
    const {studioId, ...rest} = s
    try {
        const studio = await studioRepo.editStudio(rest, studioId)
        return json(studio, {revalidate})
    } catch (error) {
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const deleteStudios = action(async (studioIds: number[], revalidate: string[] = [getStudios.key]) => {
    try {
        await studioRepo.deleteStudios(studioIds)
        return json(undefined, {revalidate})
    } catch (error) {
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});        
    }
})