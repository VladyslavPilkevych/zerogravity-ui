import { describe, expect, it } from "vitest"

import { cssUrl } from "./cssUrl"

describe("cssUrl", () => {
    it("leaves an ordinary url untouched", () => {
        expect(cssUrl("/media/my-photo_2.png?v=1")).toBe('url("/media/my-photo_2.png?v=1")')
    })

    it("keeps data uris usable", () => {
        expect(cssUrl("data:image/svg+xml;utf8,%3Csvg%3E")).toBe(
            'url("data:image/svg+xml;utf8,%3Csvg%3E")',
        )
    })

    it("encodes every character that could close the url token", () => {
        expect(cssUrl(`a"b'c(d)e\\f g`)).toBe('url("a%22b%27c%28d%29e%5Cf%20g")')
    })

    it("neutralises an attempt to inject an extra declaration", () => {
        const result = cssUrl('x.png"); background: url("evil.png')

        expect(result.match(/"/g)).toHaveLength(2)
        expect(result).not.toContain(");")
        expect(result).not.toContain('url("evil')
    })

    it("neutralises single-quoted and unquoted breakouts", () => {
        expect(cssUrl("x.png'); color: red; content: url('y")).not.toContain("');")
        expect(cssUrl("x.png); color: red")).not.toContain("); color")
    })
})
