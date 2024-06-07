import { onCleanup } from "solid-js";

export default function clickOutside(el: Element, accessor: Function) {
  const onClick = (e: any) => !el.contains(e.target) && accessor()?.();
  document.body.addEventListener("click", onClick);
  document.body.addEventListener("contextmenu", onClick);

  onCleanup(() => {
    document.body.removeEventListener("click", onClick)
    document.body.removeEventListener("contextmenu", onClick)
  });
}

declare module "solid-js" {
    namespace JSX {
      interface Directives {  
        clickOutside(el: Element, accessor: Function): void
      }
    }
  }