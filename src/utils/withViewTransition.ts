
export function withViewTransition(stateUpdate: () => void | Promise<void>) {

    if (!document.startViewTransition) {
        stateUpdate();
        return 
    }


    return document.startViewTransition(stateUpdate);
}