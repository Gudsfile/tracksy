import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useChatEngine } from './useChatEngine'

const ASSISTANT_ENABLED_KEY = 'tracksy:assistantEnabled'

beforeEach(() => {
    localStorage.clear()
})

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
