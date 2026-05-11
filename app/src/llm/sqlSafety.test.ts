import { describe, it, expect } from 'vitest'
import { validateSql } from './sqlSafety'

describe('validateSql', () => {
    it('accepts a basic SELECT', () => {
        const result = validateSql(
            'SELECT artist_name, COUNT(*) AS c FROM music_streams GROUP BY artist_name'
        )
        expect(result.ok).toBe(true)
    })

    it('accepts a CTE that ends in SELECT', () => {
        const result = validateSql(
            'WITH per_artist AS (SELECT artist_name, COUNT(*) AS c FROM music_streams GROUP BY artist_name) SELECT * FROM per_artist'
        )
        expect(result.ok).toBe(true)
    })

    it('strips a trailing semicolon', () => {
        const result = validateSql('SELECT 1 FROM music_streams;')
        expect(result.ok).toBe(true)
        if (result.ok) expect(result.sql.endsWith(';')).toBe(false)
    })

    it.each([
        'SELECT 1 FROM music_streams; DROP TABLE music_streams',
        'SELECT 1; SELECT 2',
    ])('rejects multiple statements: %s', (sql) => {
        const result = validateSql(sql)
        expect(result.ok).toBe(false)
    })

    it('rejects empty string', () => {
        expect(validateSql('').ok).toBe(false)
        expect(validateSql('   ').ok).toBe(false)
    })

    it('rejects strings exceeding length cap', () => {
        const sql = 'SELECT ' + 'a, '.repeat(2000) + '1 FROM music_streams'
        expect(validateSql(sql).ok).toBe(false)
    })

    it('rejects non-SELECT/WITH starts', () => {
        for (const sql of [
            'INSERT INTO music_streams VALUES (1)',
            'UPDATE music_streams SET ms_played = 0',
            'DELETE FROM music_streams',
            'DROP TABLE music_streams',
            'CREATE TABLE x AS SELECT 1',
            'PRAGMA database_list',
        ]) {
            const result = validateSql(sql)
            expect(result.ok, sql).toBe(false)
        }
    })

    it.each([
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
    ])('rejects denylisted keyword %s embedded in a SELECT', (keyword) => {
        const sql = `SELECT 1 FROM music_streams WHERE 1=1 ${keyword.toUpperCase()} extra`
        const result = validateSql(sql)
        expect(result.ok, keyword).toBe(false)
    })

    it('rejects keyword bypass via line comment', () => {
        // Comment hides the second statement, but our comment-stripping should still catch DROP
        const sql =
            'SELECT 1 FROM music_streams -- harmless\nDROP TABLE music_streams'
        // Even before keyword check, this has multi-statement only if ; is present.
        // After comment strip we see "SELECT 1 FROM music_streams DROP TABLE music_streams"
        // → keyword denylist catches DROP.
        expect(validateSql(sql).ok).toBe(false)
    })

    it('rejects keyword bypass via block comment', () => {
        const sql =
            'SELECT 1 FROM music_streams /* harmless */ DROP TABLE music_streams'
        expect(validateSql(sql).ok).toBe(false)
    })

    it('rejects unknown table in FROM', () => {
        const result = validateSql('SELECT * FROM evil_table')
        expect(result.ok).toBe(false)
        if (!result.ok) expect(result.reason).toMatch(/evil_table/)
    })

    it('rejects unknown table in JOIN', () => {
        const result = validateSql(
            'SELECT * FROM music_streams JOIN evil_table ON 1=1'
        )
        expect(result.ok).toBe(false)
    })

    it('accepts JOIN between allowlisted tables', () => {
        const result = validateSql(
            'SELECT m.artist_name, a.first_year FROM music_streams m JOIN artist_first_year a ON m.artist_name = a.artist_name LIMIT 10'
        )
        expect(result.ok).toBe(true)
    })

    it('accepts CTE name referenced later as if it were a table', () => {
        const result = validateSql(
            'WITH per_artist AS (SELECT artist_name FROM music_streams) SELECT * FROM per_artist'
        )
        expect(result.ok).toBe(true)
    })
})
