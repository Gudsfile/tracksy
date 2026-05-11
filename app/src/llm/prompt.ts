import { INTENTS, type IntentName } from './intents'

const SCHEMA_DESCRIPTION = `\
DuckDB schema (the user's music streaming history, fully local):

Table music_streams (one row per playback):
  track_uri TEXT, track_name TEXT, artist_name TEXT, album_name TEXT,
  ts TIMESTAMP (ISO 8601), ms_played INTEGER (milliseconds), platform TEXT

Table daily_stream_counts:
  day DATE, stream_count DOUBLE, ms_played DOUBLE

Table artist_first_year:
  artist_name TEXT, first_year INTEGER

Table stream_sessions:
  session_id INTEGER, track_count DOUBLE, duration_ms DOUBLE,
  session_start TIMESTAMP, session_end TIMESTAMP

Table summarize_cache: aggregate stats cache (rarely needed).

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
  "sql": "<only when intent is 'custom'; SELECT or WITH..SELECT, no semicolon, no DDL/DML>"
}

Rules:
- "intent" MUST be one of the catalog names.
- "params.year" only if user mentioned a year. Omit otherwise.
- "params.limit" only for top_artists/top_tracks/top_albums when user asked for a specific N.
- Use intent "custom" ONLY if no other intent fits. In "custom", you MUST include "sql" — a single SELECT/WITH..SELECT, no semicolons, querying only the tables listed above.
- Never invent table or column names. Never include any text outside the JSON object.
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
        }),
    },
    {
        user: 'Show me my top 10 tracks in 2023',
        assistant: JSON.stringify({
            intent: 'top_tracks',
            params: { year: 2023, limit: 10 },
            title: 'Top 10 tracks in 2023',
            explanation: 'Most-played tracks during 2023.',
        }),
    },
    {
        user: 'How does my listening look across the year?',
        assistant: JSON.stringify({
            intent: 'calendar_heatmap',
            params: { year: new Date().getFullYear() },
            title: 'Listening calendar',
            explanation: 'Daily listening intensity across the calendar year.',
        }),
    },
    {
        user: 'Streams per month for 2022',
        assistant: JSON.stringify({
            intent: 'streams_per_month',
            params: { year: 2022 },
            title: 'Streams per month — 2022',
            explanation: 'Monthly stream counts for the year 2022.',
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
        }),
    },
]
