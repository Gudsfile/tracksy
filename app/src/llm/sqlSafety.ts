import {
    TABLE,
    DAILY_STREAM_COUNTS_TABLE,
    ARTIST_FIRST_YEAR_TABLE,
    STREAM_SESSIONS_TABLE,
    SUMMARIZE_CACHE_TABLE,
} from '../db/queries/constants'

const TABLE_ALLOWLIST = new Set([
    TABLE,
    DAILY_STREAM_COUNTS_TABLE,
    ARTIST_FIRST_YEAR_TABLE,
    STREAM_SESSIONS_TABLE,
    SUMMARIZE_CACHE_TABLE,
])

const DENY_KEYWORDS = [
    'insert',
    'update',
    'delete',
    'drop',
    'create',
    'alter',
    'truncate',
    'attach',
    'detach',
    'copy',
    'pragma',
    'export',
    'import',
    'load',
    'install',
    'set',
    'reset',
    'vacuum',
    'checkpoint',
    'grant',
    'revoke',
    'call',
]

const MAX_SQL_LENGTH = 4000

export type SqlValidation =
    | { ok: true; sql: string }
    | { ok: false; reason: string }

function stripComments(sql: string): string {
    // /* block comments */ — non-greedy so we don't eat across statements
    let stripped = sql.replace(/\/\*[\s\S]*?\*\//g, ' ')
    // -- line comments to end of line
    stripped = stripped.replace(/--[^\n]*/g, ' ')
    return stripped
}

function extractCteNames(sql: string): Set<string> {
    const cteNames = new Set<string>()
    // matches `with name as (...)` and `, name as (...)`
    const regex = /(?:^|,|with)\s+([a-z_][a-z0-9_]*)\s+as\s*\(/gi
    let match: RegExpExecArray | null
    while ((match = regex.exec(sql)) !== null) {
        cteNames.add(match[1].toLowerCase())
    }
    return cteNames
}

function extractReferencedTables(sql: string): string[] {
    const refs: string[] = []
    const regex = /\b(?:from|join)\s+([a-z_][a-z0-9_]*)/gi
    let match: RegExpExecArray | null
    while ((match = regex.exec(sql)) !== null) {
        refs.push(match[1].toLowerCase())
    }
    return refs
}

export function validateSql(rawSql: string): SqlValidation {
    if (typeof rawSql !== 'string') {
        return { ok: false, reason: 'SQL is not a string.' }
    }

    let sql = rawSql.trim()
    if (sql.length === 0) {
        return { ok: false, reason: 'SQL is empty.' }
    }

    if (sql.length > MAX_SQL_LENGTH) {
        return {
            ok: false,
            reason: `SQL exceeds ${MAX_SQL_LENGTH} characters.`,
        }
    }

    // Allow exactly one trailing semicolon, but disallow any embedded ones
    sql = sql.replace(/;\s*$/, '')
    if (sql.includes(';')) {
        return {
            ok: false,
            reason: 'Multiple statements are not allowed.',
        }
    }

    const cleaned = stripComments(sql)
    const lower = cleaned.toLowerCase().trim()

    if (!/^(select|with)\b/.test(lower)) {
        return {
            ok: false,
            reason: 'Only SELECT or WITH..SELECT queries are allowed.',
        }
    }

    for (const keyword of DENY_KEYWORDS) {
        const re = new RegExp(`\\b${keyword}\\b`, 'i')
        if (re.test(cleaned)) {
            return {
                ok: false,
                reason: `Disallowed keyword "${keyword}" found.`,
            }
        }
    }

    const ctes = extractCteNames(cleaned)
    const referenced = extractReferencedTables(cleaned)
    for (const ref of referenced) {
        if (!TABLE_ALLOWLIST.has(ref) && !ctes.has(ref)) {
            return {
                ok: false,
                reason: `Table "${ref}" is not in the allowlist.`,
            }
        }
    }

    return { ok: true, sql }
}
