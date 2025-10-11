export function formatMonthYear(date: Date) {
    return date.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
    })
}
