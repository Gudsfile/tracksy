import type { IntentName } from '../intents'

/**
 * A distinctive literal for `scripts/assert-no-dev-code.mjs` to look for.
 *
 * Everything in this directory is dev-only. The other markers that script checks
 * belong to the tracing library; this one gives the eval registry a fingerprint
 * of its own.
 *
 * It is deliberately reached through {@link CASE_REGISTRY} rather than exported
 * on its own. A lone exported constant that nothing imports is tree-shaken
 * independently of the cases themselves — the registry would ship while its
 * marker vanished, and the check would pass on a bundle that contained exactly
 * what it was meant to catch. Verified: with the marker exported standalone, an
 * ungated `EvalBridge` produced violations for every *other* marker and none for
 * this one.
 */
const EVAL_CASE_MARKER = 'TRACKSY_EVAL_CASE_MARKER'

export type EvalCase = {
    /** Stable identifier; used as the key for run-over-run comparison. */
    id: string
    question: string
    expectedIntent: IntentName
    /**
     * Only assert a param when the question states it plainly. The router is
     * told to omit `year` unless the user mentioned one, so asserting a year the
     * question never mentions would be testing clairvoyance.
     */
    expectedParams?: { year?: number; limit?: number }
    /**
     * `non-empty` only where any non-trivial dataset must produce rows. Anything
     * scoped to a particular year or artist stays `any`, so the score measures
     * the model rather than whose export is loaded.
     */
    expectRows?: 'non-empty' | 'any'
    /**
     * Columns the *renderer* requires — not a stylistic preference. The skip-rate
     * chart throws without `complete_listens`/`skipped_listens`, the radial chart
     * needs `play_hour`, and so on. Asserting these catches an answer that looks
     * right and renders as a bare table.
     */
    expectColumns?: string[]
    /** Upper bound on rows, where an unbounded answer would be wrong. */
    maxRows?: number
    /** Why this case exists, when that is not obvious from the question. */
    note?: string
}

/**
 * The golden set: at least one case per intent, plus a few that probe parameter
 * extraction and the boundary with `custom`.
 *
 * Deliberately *not* asserted against expected rows. Datasets are generated
 * rather than committed (`e2e/datasets/` and `synthetic-datasets/datasets/` hold
 * only a `.gitkeep`), so a golden result set would encode whoever's export
 * happened to be loaded. What is asserted instead is everything that is true of
 * a correct answer regardless of the data: the intent, the params, that the SQL
 * survives the guardrail, that it executes, and that its shape can be rendered.
 */
export const CASES: EvalCase[] = [
    {
        id: 'top-artists',
        question: 'Who are my top artists?',
        expectedIntent: 'top_artists',
        expectRows: 'non-empty',
    },
    {
        id: 'top-artists-limit',
        question: 'Show me my top 5 artists',
        expectedIntent: 'top_artists',
        expectedParams: { limit: 5 },
        expectRows: 'non-empty',
        maxRows: 5,
        note: 'Probes limit extraction; an unbounded answer is wrong even though it renders.',
    },
    {
        id: 'top-tracks',
        question: 'What are my most played tracks?',
        expectedIntent: 'top_tracks',
        expectRows: 'non-empty',
    },
    {
        id: 'top-tracks-year',
        question: 'What were my top tracks in 2023?',
        expectedIntent: 'top_tracks',
        expectedParams: { year: 2023 },
        note: 'Rows stay optional: the loaded dataset may not span 2023.',
    },
    {
        id: 'top-albums',
        question: 'Which albums did I listen to most?',
        expectedIntent: 'top_albums',
        expectRows: 'non-empty',
    },
    {
        id: 'streams-per-month',
        question: 'How many streams did I have each month?',
        expectedIntent: 'streams_per_month',
        expectRows: 'non-empty',
    },
    {
        id: 'streams-per-hour',
        question: 'What hours of the day do I listen most?',
        expectedIntent: 'streams_per_hour',
        expectRows: 'non-empty',
        expectColumns: ['play_hour', 'count_streams'],
        note: 'The radial chart reads these column names directly.',
    },
    {
        id: 'streams-per-day-of-week',
        question: 'How does my listening vary across days of the week?',
        expectedIntent: 'streams_per_day_of_week',
        expectRows: 'non-empty',
    },
    {
        id: 'calendar-heatmap',
        question: 'Show my listening calendar for 2024',
        expectedIntent: 'calendar_heatmap',
        expectedParams: { year: 2024 },
        note: 'The only intent whose description states the year is required.',
    },
    {
        id: 'session-analysis',
        question: 'How long are my listening sessions?',
        expectedIntent: 'session_analysis',
        expectRows: 'non-empty',
    },
    {
        id: 'artist-discovery',
        question: 'How many new artists do I discover over time?',
        expectedIntent: 'artist_discovery',
        expectRows: 'non-empty',
    },
    {
        id: 'listening-rhythm',
        question: 'Am I a morning or a night listener?',
        expectedIntent: 'listening_rhythm',
        expectRows: 'non-empty',
        expectColumns: ['morning', 'afternoon', 'evening', 'night'],
        maxRows: 1,
        note: 'Rendered as labeled segments from a single row.',
    },
    {
        id: 'skip-rate',
        question: 'What is my skip rate?',
        expectedIntent: 'skip_rate',
        expectRows: 'non-empty',
        expectColumns: ['complete_listens', 'skipped_listens'],
        maxRows: 1,
        note: 'GenericChartRenderer throws for skip_rate without exactly these columns.',
    },
    {
        id: 'regularity',
        question: 'How regularly do I listen to music?',
        expectedIntent: 'regularity',
        expectRows: 'non-empty',
    },
    {
        id: 'new-vs-old',
        question: 'Do I listen to new releases or older music?',
        expectedIntent: 'new_vs_old',
        expectRows: 'non-empty',
    },
    {
        id: 'favorite-weekday',
        question: 'What is my favourite day of the week for listening?',
        expectedIntent: 'favorite_weekday',
        expectRows: 'non-empty',
    },
    {
        id: 'total-streams',
        question: 'How many tracks have I streamed in total?',
        expectedIntent: 'total_streams',
        expectRows: 'non-empty',
        maxRows: 1,
    },
    {
        id: 'concentration-score',
        question: 'How concentrated is my listening across my top artists?',
        expectedIntent: 'concentration_score',
        expectRows: 'non-empty',
    },
    {
        id: 'evolution-over-time',
        question: 'How has my listening grown over the years?',
        expectedIntent: 'evolution_over_time',
        expectRows: 'non-empty',
    },
    {
        id: 'principal-platform',
        question: 'Which device do I listen on the most?',
        expectedIntent: 'principal_platform',
        expectRows: 'non-empty',
    },
    {
        id: 'repeat-behavior',
        question: 'Do I replay the same track over and over?',
        expectedIntent: 'repeat_behavior',
        expectRows: 'non-empty',
    },
    {
        id: 'top-streak',
        question: 'What is my longest streak of consecutive listening days?',
        expectedIntent: 'top_streak',
        expectRows: 'non-empty',
    },
    {
        id: 'seasonal-patterns',
        question: 'How does my listening change by season?',
        expectedIntent: 'seasonal_patterns',
        expectRows: 'non-empty',
        maxRows: 1,
    },
    {
        id: 'custom-fallback',
        question:
            'Which artist do I listen to most often between midnight and 3am?',
        expectedIntent: 'custom',
        note: 'Nothing in the catalogue fits; the router should reach for custom rather than force a near-miss.',
    },
]

/**
 * The registry as consumers should reach it.
 *
 * Bundling the marker together with the cases is what makes the bundle check
 * trustworthy: the two cannot be separated by tree-shaking, so if the cases ship
 * the marker ships with them.
 */
export const CASE_REGISTRY = {
    marker: EVAL_CASE_MARKER,
    cases: CASES,
} as const
