export const DATA_LOADED_EVENT = 'tracksy:data-loaded'

export function dispatchDataLoaded(): void {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(DATA_LOADED_EVENT))
    }
}
