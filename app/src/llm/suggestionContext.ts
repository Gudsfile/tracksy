import { queryDBCached } from '../db/queries/queryDBCached'
import { TABLE } from '../db/queries/constants'

const TOP_ARTISTS_SQL = `
SELECT artist_name, COUNT(*) AS plays
FROM ${TABLE}
WHERE artist_name IS NOT NULL
GROUP BY artist_name
ORDER BY plays DESC
LIMIT 10`

const YEAR_RANGE_SQL = `
SELECT MIN(EXTRACT(year FROM ts)) AS first_year,
       MAX(EXTRACT(year FROM ts)) AS last_year
FROM ${TABLE}`

type ArtistRow = { artist_name: string }
type YearRow = { first_year: number | null; last_year: number | null }

/**
 * A few real values from the user's own library, so generated suggestions can
 * name actual artists and real years instead of inventing plausible ones.
 *
 * Both queries go through `queryDBCached`, which resolves from memory after the
 * first call and self-invalidates when new data is loaded — so this is cheap to
 * call on every keystroke pause. Returns `undefined` if the data isn't
 * queryable, in which case suggestions are simply more generic.
 */
export async function getSuggestionContext(): Promise<string | undefined> {
    try {
        const [artists, years] = await Promise.all([
            queryDBCached<ArtistRow>(TOP_ARTISTS_SQL, 'suggestionContext'),
            queryDBCached<YearRow>(YEAR_RANGE_SQL, 'suggestionContext'),
        ])

        const names = artists
            .map((r) => r.artist_name)
            .filter((n): n is string => typeof n === 'string' && n.length > 0)

        const parts: string[] = []
        if (names.length > 0) {
            parts.push(`The user's most played artists: ${names.join(', ')}.`)
        }
        const { first_year, last_year } = years[0] ?? {}
        if (first_year && last_year) {
            parts.push(
                `Their history covers ${first_year} to ${last_year}. Do not suggest years outside that range.`
            )
        }
        return parts.length > 0 ? parts.join('\n') : undefined
    } catch {
        return undefined
    }
}
