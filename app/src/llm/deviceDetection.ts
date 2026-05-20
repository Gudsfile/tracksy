export function isSafariIOS(): boolean {
    if (typeof navigator === 'undefined') return false
    const ua = navigator.userAgent
    return (
        /iP(hone|ad|od)/.test(ua) &&
        /Safari/.test(ua) &&
        !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua)
    )
}
