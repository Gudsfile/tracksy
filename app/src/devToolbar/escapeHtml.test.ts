import { describe, it, expect } from 'vitest'
import { escapeHtml } from './escapeHtml'

describe('escapeHtml', () => {
    it('escapes every character that can break out of markup', () => {
        expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;')
    })

    it('neutralises a script tag', () => {
        expect(escapeHtml('<script>alert(1)</script>')).toBe(
            '&lt;script&gt;alert(1)&lt;/script&gt;'
        )
    })

    it('neutralises an attribute-breaking payload', () => {
        // The shape that matters here: model output interpolated into a
        // `title="…"` attribute, which the toolbar does for SQL.
        expect(escapeHtml('" onmouseover="alert(1)')).toBe(
            '&quot; onmouseover=&quot;alert(1)'
        )
    })

    it('does not double-escape entities it just produced', () => {
        // A sequential replace would turn `<` into `&lt;` and then the `&` of
        // `&lt;` into `&amp;lt;`.
        expect(escapeHtml('<')).toBe('&lt;')
        expect(escapeHtml('&amp;')).toBe('&amp;amp;')
    })

    it('leaves ordinary text alone', () => {
        expect(escapeHtml('SELECT artist_name FROM music_streams')).toBe(
            'SELECT artist_name FROM music_streams'
        )
    })

    it('stringifies non-string values rather than throwing', () => {
        expect(escapeHtml(42)).toBe('42')
        expect(escapeHtml(undefined)).toBe('undefined')
        expect(escapeHtml(null)).toBe('null')
        expect(escapeHtml(true)).toBe('true')
    })
})
