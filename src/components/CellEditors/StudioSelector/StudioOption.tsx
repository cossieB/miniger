
type OptionProps = {
    value: number | null;
    text: string;
    handleChange: () => void;
};
export function Option(props: OptionProps) {
    return (
        <li
            class="hover:bg-slate-500 p-1"
            onclick={props.handleChange}
        >
            {props.text}
        </li>
    );
}
