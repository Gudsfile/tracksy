export const DATA_LOADED_EVENT = 'tracksy:data-loaded'
export const TIMEZONE_CHANGED_EVENT = 'tracksy:timezone-changed'

export function dispatchDataLoaded(): void {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(DATA_LOADED_EVENT))
    }
}

export function dispatchTimezoneChanged(): void {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(TIMEZONE_CHANGED_EVENT))
    }
}
