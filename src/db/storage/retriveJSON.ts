export function retrieveJSON<T>(key: string): T | null {
    const datasets = sessionStorage.getItem(key)

    return datasets === null ? null : (JSON.parse(datasets) as T)
}
