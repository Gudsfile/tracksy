import type { Flags } from 'lighthouse'

export const config: Flags = {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: 9222,
}
