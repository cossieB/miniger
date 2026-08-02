import { action, json, query } from "@solidjs/router";
import type { TStudio } from "~/datatypes";
import type { OptionalExcept } from "~/lib/utilityTypes";
import { state } from "~/state";
import * as studioRepo from "~/repositories/studioRepository"

export const getStudios = query(async () => {
    return studioRepo.allStudios()
}, 'studios')

export const createStudio = action(async (studio: string | Omit<TStudio, "studioId">) => {
    const studioObj = typeof studio === "string" ?  {name: studio, website: null} : studio
    try {
        const s = await studioRepo.addStudio(studioObj);
        return json(s, {revalidate: [getStudios.key]})
    }
    catch (error) {
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const updateStudio = action(async (s: OptionalExcept<TStudio, "studioId">) => {
    const {studioId, ...rest} = s
    try {
        const studio = await studioRepo.editStudio(rest, studioId)
        return json(studio, {revalidate: [getStudios.key]})
    } catch (error) {
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});
    }
})

export const deleteStudios = action(async (studioIds: number[]) => {
    try {
        await studioRepo.deleteStudios(studioIds)
        return json(undefined, {revalidate: [getStudios.key]})
    } catch (error) {
        state.status.setStatus(String(error))
        throw json(undefined, {revalidate: []});        
    }
})