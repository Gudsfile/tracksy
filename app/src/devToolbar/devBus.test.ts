import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { devBus } from './devBus'

// import.meta.env.DEV is checked inside function bodies at call time,
// so vi.stubEnv works without re-importing the module.

const PREFIX = 'tracksy:dev:'

describe('devBus', () => {
    beforeEach(() => {
        vi.unstubAllEnvs()
    })

    afterEach(() => {
        vi.unstubAllEnvs()
    })

    it('is a no-op in production (DEV=false)', () => {
        vi.stubEnv('DEV', false)

        const spy = vi.fn()
        window.addEventListener(PREFIX + 'duckdb:query', spy)
        devBus.emit('duckdb:query', {
            sql: 'SELECT 1',
            durationMs: 5,
            rowCount: 1,
        })
        window.removeEventListener(PREFIX + 'duckdb:query', spy)

        expect(spy).not.toHaveBeenCalled()
    })

    it('dispatches a CustomEvent on window when DEV=true', () => {
        vi.stubEnv('DEV', true)

        const received: unknown[] = []
        const off = devBus.on('duckdb:query', (d) => received.push(d))

        devBus.emit('duckdb:query', {
            sql: 'SELECT 42',
            durationMs: 12,
            rowCount: 3,
        })
        off()

        expect(received).toHaveLength(1)
        expect(received[0]).toEqual({
            sql: 'SELECT 42',
            durationMs: 12,
            rowCount: 3,
        })
    })

    it('on() cleanup stops receiving events', () => {
        vi.stubEnv('DEV', true)

        const calls: unknown[] = []
        const off = devBus.on('stream:parsed', (d) => calls.push(d))

        devBus.emit('stream:parsed', {
            provider: 'spotify',
            recordCount: 100,
            durationMs: 50,
        })
        off()
        devBus.emit('stream:parsed', {
            provider: 'spotify',
            recordCount: 200,
            durationMs: 60,
        })

        expect(calls).toHaveLength(1)
    })

    it('passes error field through for duckdb:query', () => {
        vi.stubEnv('DEV', true)

        const received: unknown[] = []
        const off = devBus.on('duckdb:query', (d) => received.push(d))
        devBus.emit('duckdb:query', {
            sql: 'BAD SQL',
            durationMs: 2,
            rowCount: 0,
            error: 'syntax error',
        })
        off()

        expect(received[0]).toMatchObject({
            error: 'syntax error',
            rowCount: 0,
        })
    })
})
