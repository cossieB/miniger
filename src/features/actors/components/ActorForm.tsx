import { createAsync, useAction } from "@solidjs/router";
import { state } from "~/state";
import { addActor, editActor, getActor } from "../api";
import { createSignal, For, onCleanup, Show, Suspense } from "solid-js";
import { MyLoader } from "~/components/MyLoader";
import { countryList } from "~/countryList";
import { DropZone } from "~/components/FilePicker";
import { convertFileSrc } from "@tauri-apps/api/core";
import { appDataDir, sep } from "@tauri-apps/api/path";
import { writeFile } from "@tauri-apps/plugin-fs";
import { CheckIcon, XIcon } from "lucide-solid";
import type { ActorDialog } from "~/state/dialog";

const d = await appDataDir()
const dir = d + sep() + "images" + sep()

export function ActorForm() {
    const dialog = () => state.dialog.active
    if (dialog()?.type !== "actor") throw new Error("Invalid state in ActorForm. Expected TActor but received: " + String(dialog()))

    const actor = createAsync(() => dialog()?.data ? getActor((dialog() as ActorDialog)!.data!.actorId) : Promise.resolve(null))
    const [file, setFile] = createSignal<File | null>(null)
    const [objectUrl, setObjectUrl] = createSignal("")
    onCleanup(() => URL.revokeObjectURL(objectUrl()));

    const addAction = useAction(addActor)
    const editAction = useAction(editActor)
    

    async function saveImg() {
        const f = file()
        if (!f) return undefined
        const timestamp = Date.now().toString();
        const fileType = f.name.slice(f.name.lastIndexOf("."));
        const fileName = timestamp + fileType
        const path = `${dir}${fileName}`
        try {
            const buffer = await f.arrayBuffer()
            const uint8array = new Uint8Array(buffer);
            await writeFile(path, uint8array)
            return fileName
        }
        catch (error) {
            state.status.setStatus("Error updating image: " + String(error))
            return actor()?.image
        }
    }

    const src = () => {
        if (objectUrl())
            return objectUrl()
        if (actor()?.image)
            return convertFileSrc(dir + actor()?.image)
    }

    return (
        <Suspense fallback={<MyLoader />}>
            <form
                data-for="dialog"
                method="post"
                onSubmit={async e => {
                    e.preventDefault();
                    const d = dialog()
                    if (d?.type !== "actor") throw new Error("Expected actor but received: " + String(d))
                    const fd = new FormData(e.currentTarget)
                    const data = Object.fromEntries(fd) as any
                    data.dob ||= null;
                    data.gender ||= null;
                    data.image = await saveImg();
                    if (!d.data?.actorId) {
                        await addAction(data)
                    }
                    else
                        await editAction({...data, actorId: d.data.actorId})
                    state.dialog.close()
                }}
            >
                <h1>
                    <Show
                        fallback="Edit Actor"
                        when={!dialog()?.data}
                    >
                        Add Actor
                    </Show>
                </h1>
                <div data-for="form-group">
                    <input
                        style={{ flex: "1" }}
                        value={actor()?.name ?? ""}
                        placeholder="Name"
                        name="name"
                        type="text"
                        required
                        minLength={1}
                    />
                    <select name="gender" id="">
                        <option value="">Gender</option>
                        <option selected={actor()?.gender === "M"} value="M">M</option>
                        <option selected={actor()?.gender === "F"} value="F">F</option>
                    </select>
                </div>

                <select name="nationality" id="">
                    <option value="">Nationality</option>
                    <For each={countryList}>
                        {country => (
                            <option selected={actor()?.nationality === country} value={country}>{country}</option>
                        )}
                    </For>
                </select>
                <div data-for="form-group">
                    <label >D.O.B</label>
                    <input type="date" name="dob" value={actor()?.dob ?? ""} />
                </div>
                <DropZone
                    setFile={setFile}
                    setObjectUrl={url => {
                        URL.revokeObjectURL(objectUrl())
                        setObjectUrl(URL.createObjectURL(url))
                    }}
                />
                <img
                    data-preview
                    src={src() ?? "/Question_Mark.svg"}
                />
                <div data-btns class={`flexCenter`}>
                    <button type="submit" class="button"><span>Accept</span> <CheckIcon /> </button>
                    <button
                        class="button"
                        type="button"
                        onClick={() => state.dialog.close()}
                    >
                        <span>Cancel</span> <XIcon /> </button>
                </div>
            </form>
        </Suspense>
    )
}