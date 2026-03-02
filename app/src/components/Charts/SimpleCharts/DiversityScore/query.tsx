import { TABLE } from '../../../../db/queries/constants'

export type DiversityResult = {
    unique_artists: number
    total_streams: number
    avg_streams_per_artist: number
}

export function queryDiversityScore(year: number): string {
    return `
    SELECT
      COUNT(DISTINCT artist_name)::DOUBLE AS unique_artists,
      COUNT(*)::DOUBLE AS total_streams,
      (COUNT(*)::DOUBLE / COUNT(DISTINCT artist_name)::DOUBLE) AS avg_streams_per_artist
    FROM ${TABLE}
    WHERE artist_name IS NOT NULL
    AND YEAR(ts::DATE) = ${year}
  `
}
