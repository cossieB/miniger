export function compareArrays<T extends string | number>(arr1: T[], arr2: T[]) {
    if (arr1.length != arr2.length) return false;

    const arr1Sorted = arr1.toSorted();
    const arr2Sorted = arr2.toSorted();

    for (let i = 0; i < arr1.length; i++) {
        if (arr1Sorted[i] != arr2Sorted[i]) return false
    }
    return true
}