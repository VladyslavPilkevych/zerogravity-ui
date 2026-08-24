export type TokenType =
    "keyword" | "tag" | "attr" | "string" | "number" | "boolean" | "punct" | "plain"

export interface Token {
    text: string
    type: TokenType
}

const RULES: [TokenType, RegExp][] = [
    ["string", /^"(?:[^"\\]|\\.)*"/],
    ["string", /^'(?:[^'\\]|\\.)*'/],
    ["tag", /^<\/?[A-Za-z][\w.]*/],
    ["keyword", /^(?:import|from|export|const|let|return)\b/],
    ["boolean", /^(?:true|false|null|undefined)\b/],
    ["number", /^-?\d+(?:\.\d+)?/],
    ["plain", /^[A-Za-z_$][\w$]*/],
    ["punct", /^[{}()[\]<>/=,.:;]/],
    ["plain", /^\s+/],
    ["plain", /^[\s\S]/],
]

/**
 * Just enough of a TSX tokenizer for generated snippets. It keeps the client
 * bundle free of a highlighting library for what is only ever read-only code.
 */
export function tokenize(source: string): Token[] {
    const tokens: Token[] = []
    let rest = source
    let inTag = false

    while (rest.length > 0) {
        for (const [type, pattern] of RULES) {
            const found = pattern.exec(rest)
            if (!found) continue

            const text = found[0]
            let resolved = type

            if (type === "tag") inTag = true
            else if (type === "punct" && (text === ">" || text === "/")) inTag = false
            else if (type === "plain" && inTag && /^[A-Za-z_$]/.test(text)) resolved = "attr"

            const last = tokens[tokens.length - 1]
            if (last && last.type === resolved) last.text += text
            else tokens.push({ text, type: resolved })

            rest = rest.slice(text.length)
            break
        }
    }

    return tokens
}
