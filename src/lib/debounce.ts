export function debounce<T extends (...args: any[]) => any>(cb: T,  delay = 300) {
    let timerId = -1

    return function (...args: Parameters<T>): void {
        clearTimeout(timerId)
        timerId = setTimeout(() => {
            cb(...args)
        }, delay)
    }
}