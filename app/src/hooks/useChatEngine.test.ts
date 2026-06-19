import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import { useChatEngine, type AskResult } from './useChatEngine'
import * as engineModule from '../llm/engine'
import * as askLLMModule from '../llm/askLLM'
import * as queryDBModule from '../db/queries/queryDB'
import * as deviceDetection from '../llm/deviceDetection'
import { makeChatAnswer } from '../llm/testHelpers'

const ASSISTANT_ENABLED_KEY = 'tracksy:assistantEnabled'

const mockEngine = {} as MLCEngineInterface

function answer(overrides = {}) {
    return makeChatAnswer(undefined, overrides)
}

beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    vi.spyOn(engineModule, 'isWebGPUAvailable').mockReturnValue(true)
    vi.spyOn(engineModule, 'getEngine').mockResolvedValue(mockEngine)
    vi.spyOn(deviceDetection, 'isMobileBrowser').mockReturnValue(false)
})

async function loadedHook() {
    const hook = renderHook(() => useChatEngine())
    await act(async () => {
        await hook.result.current.ensureLoaded()
    })
    return hook
}

async function ask(
    hook: Awaited<ReturnType<typeof loadedHook>>
): Promise<AskResult> {
    let result: AskResult | undefined
    await act(async () => {
        result = await hook.result.current.ask('question', [])
    })
    return result!
}

describe('useChatEngine — fresh visit', () => {
    it('stays idle when no preference is stored', () => {
        const { result } = renderHook(() => useChatEngine())
        expect(result.current.state.kind).toBe('idle')
    })
})

describe('useChatEngine — returning visit', () => {
    it('auto-starts loading when preference key is set', async () => {
        localStorage.setItem(ASSISTANT_ENABLED_KEY, 'true')

        const { result } = renderHook(() => useChatEngine())

        // jsdom has no WebGPU, so ensureLoaded() settles to 'unsupported' —
        // but any non-idle state proves the auto-load fired.
        await waitFor(() => {
            expect(result.current.state.kind).not.toBe('idle')
        })
    })
})

describe('useChatEngine — explicit enable', () => {
    it('writes the preference key to localStorage when ensureLoaded is called', async () => {
        const { result } = renderHook(() => useChatEngine())

        expect(localStorage.getItem(ASSISTANT_ENABLED_KEY)).toBeNull()

        await act(async () => {
            await result.current.ensureLoaded()
        })

        expect(localStorage.getItem(ASSISTANT_ENABLED_KEY)).toBe('true')
    })

    it('transitions away from idle after explicit enable', async () => {
        const { result } = renderHook(() => useChatEngine())

        await act(async () => {
            await result.current.ensureLoaded()
        })

        expect(result.current.state.kind).not.toBe('idle')
    })
})

describe('useChatEngine.ask (unified SQL path)', () => {
    it('executes the generated SQL and returns rows for a preset (non-custom) intent', async () => {
        const rows = [{ artist_name: 'Radiohead', c: 1204 }]
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(
            answer({ intent: 'top_artists' })
        )
        const querySpy = vi
            .spyOn(queryDBModule, 'queryDBAsJSON')
            .mockResolvedValue(rows)

        const result = await ask(await loadedHook())

        expect(querySpy).toHaveBeenCalledTimes(1)
        expect(result.payload.kind).toBe('ok')
        expect(result.rows).toEqual(rows)
    })

    it('attaches streamNarrator on desktop and omits it on mobile', async () => {
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(answer())
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue([{ x: 1 }])

        const desktop = await ask(await loadedHook())
        expect(desktop.streamNarrator).toBeTypeOf('function')

        vi.spyOn(deviceDetection, 'isMobileBrowser').mockReturnValue(true)
        const mobile = await ask(await loadedHook())
        expect(mobile.streamNarrator).toBeUndefined()
    })

    it('retries once with the error appended when the first SQL fails', async () => {
        const askSpy = vi
            .spyOn(askLLMModule, 'askLLM')
            .mockResolvedValueOnce(
                answer({ sql: 'SELECT 1 FROM music_streams' })
            )
            .mockResolvedValueOnce(
                answer({ sql: 'SELECT 2 FROM music_streams' })
            )
        vi.spyOn(queryDBModule, 'queryDBAsJSON')
            .mockRejectedValueOnce(new Error('boom'))
            .mockResolvedValueOnce([{ ok: 1 }])

        const result = await ask(await loadedHook())

        expect(askSpy).toHaveBeenCalledTimes(2)
        expect(askSpy.mock.calls[1][1]).toContain('Previous SQL failed with:')
        expect(result.payload.kind).toBe('ok')
        expect(result.rows).toEqual([{ ok: 1 }])
    })

    it('returns sql-error when the retried SQL also fails', async () => {
        vi.spyOn(askLLMModule, 'askLLM')
            .mockResolvedValueOnce(
                answer({ sql: 'SELECT 1 FROM music_streams' })
            )
            .mockResolvedValueOnce(
                answer({ sql: 'SELECT 2 FROM music_streams' })
            )
        vi.spyOn(queryDBModule, 'queryDBAsJSON')
            .mockRejectedValueOnce(new Error('boom1'))
            .mockRejectedValueOnce(new Error('boom2'))

        const result = await ask(await loadedHook())

        expect(result.payload.kind).toBe('sql-error')
    })

    it('returns unsafe-sql without querying when validation rejects the SQL', async () => {
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(
            answer({ sql: 'DROP TABLE music_streams' })
        )
        const querySpy = vi.spyOn(queryDBModule, 'queryDBAsJSON')

        const result = await ask(await loadedHook())

        expect(result.payload.kind).toBe('unsafe-sql')
        expect(querySpy).not.toHaveBeenCalled()
    })
})
