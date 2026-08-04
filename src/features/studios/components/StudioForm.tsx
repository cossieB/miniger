import { createAsync, useAction, useSubmission } from "@solidjs/router";
import { state } from "~/state";
import { createStudio, getStudio, updateStudio } from "../api";
import type { StudioDialog } from "~/state/dialog";
import { Show, Suspense } from "solid-js";
import { MyLoader } from "~/components/MyLoader";
import { DialogForm } from "~/components/dialog/DialogForm";

export function StudioForm() {
    const dialog = () => state.dialog.active
    const studio = createAsync(() => dialog()?.data ? getStudio((dialog() as StudioDialog)!.data!.studioId) : Promise.resolve(null))
    const addAction = useAction(createStudio)
    const editAction = useAction(updateStudio)
    const sub1 = useSubmission(createStudio)
    const sub2 = useSubmission(updateStudio)
    return (
        <Suspense fallback={<MyLoader />}>
            <DialogForm
                pending={sub1.pending || !!sub2.pending}            
                onSubmit={async e => {
                    e.preventDefault();
                    const d = dialog()
                    if (d?.type !== "studio") throw new Error("Expected studio but received: " + String(d))
                    const fd = new FormData(e.currentTarget)
                    const data = Object.fromEntries(fd) as any
                    if (!d.data?.studioId)
                        await addAction(data)
                    else
                        await editAction({...data, studioId: d.data.studioId})
                    state.dialog.close()
                }}
            >
                <h1>
                    <Show
                        fallback="Edit Studio"
                        when={!dialog()?.data}
                    >
                        Add Studio
                    </Show>
                </h1>
                <input type="text" required minLength={1} placeholder="Name" name="name" value={studio()?.name ?? ""} />
                <input type="text" placeholder="Website" name="website" value={studio()?.website ?? ""} />
            </DialogForm>
        </Suspense>
    )
}