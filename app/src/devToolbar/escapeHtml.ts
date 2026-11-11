const REPLACEMENTS: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
}

/**
 * Escapes a value for interpolation into an HTML string.
 *
 * The toolbar builds its markup with template literals and `innerHTML`, and the
 * text it renders is not ours: model-authored SQL, captured prompts, completions,
 * and error messages. A completion containing `<img onerror=…>` would otherwise
 * execute in the page the toolbar is inspecting. Every interpolation of
 * non-literal text goes through here.
 *
 * `&` is replaced first by virtue of being in the same pass — a sequential
 * replace would double-escape the entities produced by the later rules.
 */
export function escapeHtml(value: unknown): string {
    return String(value).replace(
        /[&<>"']/g,
        (character) => REPLACEMENTS[character] ?? character
    )
}
