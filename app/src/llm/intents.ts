export const INTENT_NAMES = [
    'top_artists',
    'top_tracks',
    'top_albums',
    'streams_per_month',
    'streams_per_hour',
    'streams_per_day_of_week',
    'calendar_heatmap',
    'session_analysis',
    'artist_discovery',
    'listening_rhythm',
    'skip_rate',
    'regularity',
    'new_vs_old',
    'favorite_weekday',
    'total_streams',
    'custom',
] as const

export type IntentName = (typeof INTENT_NAMES)[number]

export type IntentSpec = {
    description: string
    acceptsYear: boolean
    acceptsLimit: boolean
}

export const INTENTS: Record<IntentName, IntentSpec> = {
    top_artists: {
        description: 'Top artists ranked by stream count',
        acceptsYear: true,
        acceptsLimit: true,
    },
    top_tracks: {
        description: 'Top tracks ranked by stream count',
        acceptsYear: true,
        acceptsLimit: true,
    },
    top_albums: {
        description: 'Top albums ranked by stream count',
        acceptsYear: true,
        acceptsLimit: true,
    },
    streams_per_month: {
        description: 'Streams aggregated per month within a year',
        acceptsYear: true,
        acceptsLimit: false,
    },
    streams_per_hour: {
        description: 'Hourly stream distribution shown as a radial chart',
        acceptsYear: true,
        acceptsLimit: false,
    },
    streams_per_day_of_week: {
        description: 'Streams aggregated per day of week',
        acceptsYear: true,
        acceptsLimit: false,
    },
    calendar_heatmap: {
        description:
            'Calendar heatmap of listening activity for a single year (year is required)',
        acceptsYear: true,
        acceptsLimit: false,
    },
    session_analysis: {
        description: 'Listening session statistics (length, frequency)',
        acceptsYear: true,
        acceptsLimit: false,
    },
    artist_discovery: {
        description: 'New vs cumulative artists discovered over time',
        acceptsYear: false,
        acceptsLimit: false,
    },
    listening_rhythm: {
        description:
            'Distribution of listening across morning, afternoon, evening, night',
        acceptsYear: true,
        acceptsLimit: false,
    },
    skip_rate: {
        description: 'Share of streams that were skipped vs completed',
        acceptsYear: true,
        acceptsLimit: false,
    },
    regularity: {
        description:
            'How regularly the user listens (days with streams, longest pause)',
        acceptsYear: true,
        acceptsLimit: false,
    },
    new_vs_old: {
        description: 'Streams of newly released music vs older catalog',
        acceptsYear: true,
        acceptsLimit: false,
    },
    favorite_weekday: {
        description: 'Top weekday for listening',
        acceptsYear: true,
        acceptsLimit: false,
    },
    total_streams: {
        description: 'Lifetime total of streams',
        acceptsYear: false,
        acceptsLimit: false,
    },
    custom: {
        description:
            'Fallback for any question not covered above. Requires a SELECT-only SQL string in the answer.',
        acceptsYear: false,
        acceptsLimit: false,
    },
}

export function isIntentName(value: unknown): value is IntentName {
    return (
        typeof value === 'string' &&
        (INTENT_NAMES as readonly string[]).includes(value)
    )
}
