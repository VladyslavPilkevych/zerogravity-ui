const UNSAFE_IN_CSS_URL = /["'()\\\s]/g

function percentEncode(character: string): string {
    return `%${character.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")}`
}

export function cssUrl(value: string): string {
    return `url("${value.replace(UNSAFE_IN_CSS_URL, percentEncode)}")`
}
