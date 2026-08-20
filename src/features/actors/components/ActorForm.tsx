import { createAsync, useAction, useSubmission } from "@solidjs/router";
import { state } from "~/state";
import { addActor, editActor, getActor } from "../api";
import { createSignal, For, Show, Suspense } from "solid-js";
import { MyLoader } from "~/components/MyLoader";
import { countryList } from "~/countryList";
import { DropZone } from "~/components/FilePicker";
import type { ActorDialog } from "~/state/dialog";
import { saveImg } from "~/utils/saveImg";
import { DialogForm } from "~/components/dialog/DialogForm";

export function ActorForm() {
    const dialog = () => state.dialog.active
    // if (dialog()?.type !== "actor") throw new Error("Invalid state in ActorForm. Expected TActor but received: " + String(dialog()))

    const actor = createAsync(() => dialog()?.data ? getActor((dialog() as ActorDialog)!.data!.actorId) : Promise.resolve(null))
    const [file, setFile] = createSignal<File | null>(null)

    const addAction = useAction(addActor)
    const editAction = useAction(editActor)
    const sub1 = useSubmission(addActor)
    const sub2 = useSubmission(editActor)
    return (
        <Suspense fallback={<MyLoader />}>
            <DialogForm
                pending={sub1.pending || !!sub2.pending}
                onSubmit={async (e) => {
                    e.preventDefault()
                    const d = dialog()
                    if (d?.type !== "actor") throw new Error("Expected actor but received: " + String(d))
                    const fd = new FormData(e.currentTarget)
                    const data = Object.fromEntries(fd) as any
                    data.dob ||= null;
                    data.gender ||= null;
                    if (!d.data?.actorId) {
                        const { actorId } = await addAction(data)
                        if (file())
                            await saveImg(file()!, "images", actorId) ?? undefined;
                    }
                    else
                        await editAction({ ...data, actorId: d.data.actorId })
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
                <div style={{ height: "13rem" }}>
                    <DropZone
                        setFile={setFile}
                        image={`${actor()?.actorId}.webp`}
                    />
                </div>
            </DialogForm>
        </Suspense>
    )
}