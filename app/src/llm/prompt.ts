import { INTENTS, type IntentName } from './intents'
import {
    TABLE,
    DAILY_STREAM_COUNTS_TABLE,
    ARTIST_FIRST_YEAR_TABLE,
    STREAM_SESSIONS_TABLE,
    SUMMARIZE_CACHE_TABLE,
} from '../db/queries/constants'

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_DATE = new Date().toISOString().split('T')[0]

const SCHEMA_DESCRIPTION = `\
DuckDB schema (the user's music streaming history, fully local):

Table ${TABLE} (one row per playback):
  track_uri TEXT, track_name TEXT, artist_name TEXT, album_name TEXT,
  ts TIMESTAMP (ISO 8601), ms_played INTEGER (milliseconds), platform TEXT

Table ${DAILY_STREAM_COUNTS_TABLE}:
  day DATE, stream_count DOUBLE, ms_played DOUBLE

Table ${ARTIST_FIRST_YEAR_TABLE}:
  artist_name TEXT, first_year INTEGER

Table ${STREAM_SESSIONS_TABLE}:
  session_id INTEGER, track_count DOUBLE, duration_ms DOUBLE,
  session_start TIMESTAMP, session_end TIMESTAMP

Table ${SUMMARIZE_CACHE_TABLE}: aggregate stats cache (rarely needed).

Notes:
- Use ts::date for grouping by day. EXTRACT(year FROM ts) for year.
- ms_played is milliseconds (divide by 60000 for minutes).
- Only SELECT or WITH..SELECT statements are allowed in custom SQL.
`

function intentCatalog(): string {
    return (Object.keys(INTENTS) as IntentName[])
        .map((name) => {
            const spec = INTENTS[name]
            const params: string[] = []
            if (spec.acceptsYear) params.push('year (int, optional)')
            if (spec.acceptsLimit) params.push('limit (int, optional)')
            const paramStr = params.length
                ? ` [params: ${params.join(', ')}]`
                : ''
            return `  - ${name}${paramStr}: ${spec.description}`
        })
        .join('\n')
}

export const SYSTEM_PROMPT = `\
You are a routing assistant for a local music-listening data app.

Given a user question, you choose ONE intent from the catalog below, fill in optional params, and return a single JSON object — nothing else.

${SCHEMA_DESCRIPTION}

Available intents (pick exactly one):
${intentCatalog()}

Output format (return EXACTLY one JSON object, no prose, no code fences, no comments, double-quoted keys):
{
  "intent": "<one of the intent names above>",
  "params": { "year": <int|omit>, "limit": <int|omit> },
  "title": "<short chart title>",
  "explanation": "<one sentence: what the chart shows>",
  "sql": "<SELECT or WITH..SELECT representing this question, no semicolon, no DDL/DML>"
}

Rules:
- "intent" MUST be one of the catalog names.
- "sql" is ALWAYS required for every intent, including non-custom ones.
- "params.year" only if user mentioned a year. Omit otherwise.
- "params.limit" only for top_artists/top_tracks/top_albums when user asked for a specific N.
- Use intent "custom" ONLY if no other intent fits.
- Never invent table or column names. Never include any text outside the JSON object.
- Today is ${CURRENT_DATE}. When the user says "this year", "current year", or similar without an explicit year, use ${CURRENT_YEAR} in the SQL and params.
`

export type FewShot = { user: string; assistant: string }

export const FEW_SHOTS: FewShot[] = [
    {
        user: 'Who are my top artists?',
        assistant: JSON.stringify({
            intent: 'top_artists',
            params: {},
            title: 'Top artists',
            explanation: 'Artists ranked by total stream count.',
            sql: 'SELECT artist_name, COUNT(*)::DOUBLE AS count_streams, SUM(ms_played)::DOUBLE AS ms_played FROM music_streams WHERE artist_name IS NOT NULL GROUP BY artist_name ORDER BY count_streams DESC LIMIT 5',
        }),
    },
    {
        user: 'What are my top artists this year?',
        assistant: JSON.stringify({
            intent: 'top_artists',
            params: { year: CURRENT_YEAR },
            title: `Top artists ${CURRENT_YEAR}`,
            explanation: `Artists ranked by total stream count in ${CURRENT_YEAR}.`,
            sql: `SELECT artist_name, COUNT(*)::DOUBLE AS count_streams, SUM(ms_played)::DOUBLE AS ms_played FROM music_streams WHERE artist_name IS NOT NULL AND EXTRACT(year FROM ts) = ${CURRENT_YEAR} GROUP BY artist_name ORDER BY count_streams DESC LIMIT 5`,
        }),
    },
    {
        user: 'Show me my top 10 tracks in 2023',
        assistant: JSON.stringify({
            intent: 'top_tracks',
            params: { year: 2023, limit: 10 },
            title: 'Top 10 tracks in 2023',
            explanation: 'Most-played tracks during 2023.',
            sql: 'SELECT track_name, artist_name, COUNT(*)::DOUBLE AS count_streams FROM music_streams WHERE EXTRACT(year FROM ts) = 2023 AND track_name IS NOT NULL GROUP BY track_name, artist_name ORDER BY count_streams DESC LIMIT 10',
        }),
    },
    {
        user: 'How does my listening look across the year?',
        assistant: JSON.stringify({
            intent: 'calendar_heatmap',
            params: { year: new Date().getFullYear() },
            title: 'Listening calendar',
            explanation: 'Daily listening intensity across the calendar year.',
            sql: `SELECT ts::date AS day, COUNT(*)::DOUBLE AS stream_count FROM music_streams WHERE EXTRACT(year FROM ts) = ${new Date().getFullYear()} GROUP BY ts::date ORDER BY day`,
        }),
    },
    {
        user: 'Streams per month for 2022',
        assistant: JSON.stringify({
            intent: 'streams_per_month',
            params: { year: 2022 },
            title: 'Streams per month — 2022',
            explanation: 'Monthly stream counts for the year 2022.',
            sql: "SELECT DATE_TRUNC('month', ts) AS month, COUNT(*)::DOUBLE AS count_streams, SUM(ms_played)::DOUBLE AS ms_played FROM music_streams WHERE EXTRACT(year FROM ts) = 2022 GROUP BY month ORDER BY month",
        }),
    },
    {
        user: 'How many minutes per platform did I listen on?',
        assistant: JSON.stringify({
            intent: 'custom',
            params: {},
            title: 'Minutes listened per platform',
            explanation:
                'Total minutes of playback grouped by reported platform.',
            sql: 'SELECT platform, SUM(ms_played) / 60000.0 AS minutes FROM music_streams WHERE platform IS NOT NULL GROUP BY platform ORDER BY minutes DESC',
        }),
    },
    {
        user: 'What is my skip rate?',
        assistant: JSON.stringify({
            intent: 'skip_rate',
            params: {},
            title: 'Skip rate',
            explanation: 'Share of streams that were skipped vs completed.',
            sql: 'SELECT COUNT(*) FILTER (WHERE ms_played < 30000)::DOUBLE AS skipped_listens, COUNT(*) FILTER (WHERE ms_played >= 30000)::DOUBLE AS complete_listens FROM music_streams',
        }),
    },
]
