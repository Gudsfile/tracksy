import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import { useChatEngine, type AskResult } from './useChatEngine'
import * as engineModule from '../llm/engine'
import * as askLLMModule from '../llm/askLLM'
import * as askChartConfigModule from '../llm/askChartConfig'
import * as queryDBModule from '../db/queries/queryDB'
import * as deviceDetection from '../llm/deviceDetection'
import {
    configFromPreset,
    saveConfig,
    ASSISTANT_CONFIG_KEY,
    type PresetName,
} from '../llm/assistantConfig'
import { makeChatAnswer } from '../llm/testHelpers'
import { LLMError } from '../llm/types'

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

async function loadedHook(preset: PresetName = 'rich') {
    const hook = renderHook(() => useChatEngine())
    await act(async () => {
        await hook.result.current.enableWith(configFromPreset(preset))
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

describe('useChatEngine — onboarding gate', () => {
    it('stays idle when no config is stored', () => {
        const { result } = renderHook(() => useChatEngine())
        expect(result.current.state.kind).toBe('idle')
    })

    it('shows onboarding (stays idle) for a pre-feature user who is enabled but has no config', async () => {
        localStorage.setItem(ASSISTANT_ENABLED_KEY, 'true')

        const { result } = renderHook(() => useChatEngine())

        // Give the mount effect a tick; it must NOT auto-load without a config.
        await act(async () => {
            await Promise.resolve()
        })
        expect(result.current.state.kind).toBe('idle')
    })
})

describe('useChatEngine — returning visit', () => {
    it('auto-loads when both enabled flag and a stored config are present', async () => {
        localStorage.setItem(ASSISTANT_ENABLED_KEY, 'true')
        saveConfig(configFromPreset('rich'))

        const { result } = renderHook(() => useChatEngine())

        await waitFor(() => {
            expect(result.current.state.kind).not.toBe('idle')
        })
    })
})

describe('useChatEngine — enableWith', () => {
    it('persists the config and enabled flag, then leaves idle', async () => {
        const { result } = renderHook(() => useChatEngine())

        expect(localStorage.getItem(ASSISTANT_ENABLED_KEY)).toBeNull()
        expect(localStorage.getItem(ASSISTANT_CONFIG_KEY)).toBeNull()

        await act(async () => {
            await result.current.enableWith(configFromPreset('lite'))
        })

        expect(localStorage.getItem(ASSISTANT_ENABLED_KEY)).toBe('true')
        expect(localStorage.getItem(ASSISTANT_CONFIG_KEY)).toContain('lite')
        expect(result.current.state.kind).not.toBe('idle')
    })
})

describe('useChatEngine.ask (unified SQL path)', () => {
    it('executes the generated SQL and returns rows', async () => {
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

    it('streams the narrative for a stream config (Rich) and skips it for a static config (Lite)', async () => {
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(answer())
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue([{ x: 1 }])

        const rich = await ask(await loadedHook('rich'))
        expect(rich.streamNarrator).toBeTypeOf('function')

        const lite = await ask(await loadedHook('lite'))
        expect(lite.streamNarrator).toBeUndefined()
    })

    it('runs the ChartAgent for a llm-chart config (Rich)', async () => {
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(answer())
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue([{ x: 1 }])
        const chartSpy = vi
            .spyOn(askChartConfigModule, 'askChartConfig')
            .mockResolvedValue({ type: 'metric', key: 'x' })

        const result = await ask(await loadedHook('rich'))

        expect(chartSpy).toHaveBeenCalledTimes(1)
        expect(result.chartConfig).toEqual({ type: 'metric', key: 'x' })
    })

    it('renders a table without the ChartAgent for an off-chart config (Minimal)', async () => {
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(answer())
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue([{ x: 1 }])
        const chartSpy = vi.spyOn(askChartConfigModule, 'askChartConfig')

        const result = await ask(await loadedHook('minimal'))

        expect(chartSpy).not.toHaveBeenCalled()
        expect(result.chartConfig).toEqual({ type: 'table' })
    })

    it('leaves chartConfig undefined for an infer-chart config (Lite)', async () => {
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(answer())
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue([{ x: 1 }])
        const chartSpy = vi.spyOn(askChartConfigModule, 'askChartConfig')

        const result = await ask(await loadedHook('lite'))

        expect(chartSpy).not.toHaveBeenCalled()
        expect(result.chartConfig).toBeUndefined()
    })

    it('omits chart + narrator when SQL returns empty rows', async () => {
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(answer())
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue([])

        const result = await ask(await loadedHook('rich'))

        expect(result.payload.kind).toBe('ok')
        expect(result.rows).toEqual([])
        expect(result.streamNarrator).toBeUndefined()
        expect(result.chartConfig).toBeUndefined()
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

        const result = await ask(await loadedHook('minimal'))

        expect(askSpy).toHaveBeenCalledTimes(2)
        expect(askSpy.mock.calls[1][1]).toContain('Previous SQL failed with:')
        // The retry must be cancellable via Stop: it receives the same abort
        // signal the first call does (F041).
        expect(askSpy.mock.calls[1][3]).toBeInstanceOf(AbortSignal)
        expect(askSpy.mock.calls[1][3]).toBe(askSpy.mock.calls[0][3])
        // The fixup prompt interpolates the error *message*, not a raw Error
        // object stringified as "[object Object]".
        expect(askSpy.mock.calls[1][1]).toContain('boom')
        expect(askSpy.mock.calls[1][1]).not.toContain('[object Object]')
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

        const result = await ask(await loadedHook('minimal'))

        expect(result.payload.kind).toBe('sql-error')
    })

    it('returns aborted (not sql-error) when the retry is cancelled', async () => {
        // First answer is fine, but its SQL fails; the retry is then cancelled
        // via Stop, so askLLM rejects with an aborted LLMError. That must
        // surface as a clean cancellation, not a misleading SQL error.
        vi.spyOn(askLLMModule, 'askLLM')
            .mockResolvedValueOnce(
                answer({ sql: 'SELECT 1 FROM music_streams' })
            )
            .mockRejectedValueOnce(new LLMError('Cancelled', 'aborted'))
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockRejectedValueOnce(
            new Error('boom')
        )

        const result = await ask(await loadedHook('minimal'))

        expect(result.payload.kind).toBe('aborted')
    })

    it('returns unsafe-sql without querying when validation rejects the SQL', async () => {
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(
            answer({ sql: 'DROP TABLE music_streams' })
        )
        const querySpy = vi.spyOn(queryDBModule, 'queryDBAsJSON')

        const result = await ask(await loadedHook('minimal'))

        expect(result.payload.kind).toBe('unsafe-sql')
        expect(querySpy).not.toHaveBeenCalled()
    })
})
