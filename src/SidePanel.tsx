export function SidePanel() {
    return (
        <section
            class="bg-gray-800 flex-1 basis-14"
            onDragEnter={e => {
                e.preventDefault();
                (e.target as HTMLElement).classList.add("bg-slate-500")
            }}
            ondrop={e => {console.log("HERE")
                e.preventDefault();
                (e.target as HTMLElement).classList.remove("bg-slate-500")
            }}
            ondragover={e => e.preventDefault()}
            ondragleave={e => {
                e.preventDefault();
                (e.target as HTMLElement).classList.remove("bg-slate-500")
            }}
        >
            SIde panel
        </section>
    );
}
