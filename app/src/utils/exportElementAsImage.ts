import { DARK_CLASS } from '../hooks/theme.constants'

/** Page background colours, mirroring the `bg-*` classes used by the app shell. */
const BACKGROUND = {
    light: '#f8fafc',
    dark: '#020617',
} as const

/** Resolve the current effective theme from the `<html>` element. */
function currentBackground(): string {
    const isDark =
        typeof document !== 'undefined' &&
        document.documentElement.classList.contains(DARK_CLASS)
    return isDark ? BACKGROUND.dark : BACKGROUND.light
}

/** Build a filesystem-friendly, timestamped filename such as `tracksy-2026-07-26.png`. */
export function buildImageFilename(prefix = 'tracksy'): string {
    const date = new Date().toISOString().slice(0, 10)
    return `${prefix}-${date}.png`
}

/** Trigger a browser download for the given data URL. */
function downloadDataUrl(dataUrl: string, filename: string): void {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    link.click()
}

/**
 * Capture a DOM element as a PNG and download it.
 *
 * Renders at 2x pixel ratio for a crisp, shareable image and applies the current
 * theme background so charts and text stay legible in both light and dark mode.
 *
 * @throws if the capture fails (e.g. tainted canvas, unsupported browser).
 */
export async function exportElementAsImage(
    element: HTMLElement,
    filename = buildImageFilename()
): Promise<void> {
    const { toPng } = await import('html-to-image')
    const dataUrl = await toPng(element, {
        backgroundColor: currentBackground(),
        pixelRatio: 2,
        cacheBust: true,
    })
    downloadDataUrl(dataUrl, filename)
}
