import { redirect } from "@solidjs/router";
import { deco } from "./encodeDecode";

export function getId(str: string, redirectTo: string) {
    const decoded = deco(str); 
    const s = typeof decoded == "string" ? str : decoded.id
    const num = Number(s);
    if (Number.isNaN(num)) throw redirect(redirectTo)
    return num
}