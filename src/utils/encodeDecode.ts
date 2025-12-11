export function enc(obj: {display: string, id: string | number}) {
    return encodeURIComponent(JSON.stringify(obj))
}

export function deco(str: string) {
    const temp = decodeURIComponent(str)
    try {
        return JSON.parse(temp) as {display: string, id: string | number} 
    } catch (error) {
        return temp
    }
}