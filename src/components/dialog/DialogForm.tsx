import { CheckIcon, XIcon } from "lucide-solid";
import { splitProps, type ComponentProps } from "solid-js";
import type { Require } from "~/lib/utilityTypes";
import { state } from "~/state";

type Props = Require<ComponentProps<'form'>, 'onSubmit' | 'children'> & {
    pending: boolean
}

export function DialogForm(props: Props) {
    const [local, formProps] = splitProps(props, ['pending'])
    return (
        <form
            {...formProps}
            data-for="dialog"
            method="post"
            onSubmit={props.onSubmit}
        >
            {props.children}
            <div data-btns class={`flexCenter`}>
                <button
                    type="submit"
                    class="button"
                    disabled={local.pending}
                >
                    <span>Accept</span> <CheckIcon />
                </button>
                <button
                    class="button"
                    type="button"
                    onClick={() => state.dialog.close()}
                    disabled={local.pending}
                >
                    <span>Cancel</span> <XIcon /> </button>
            </div>
        </form>
    )
}