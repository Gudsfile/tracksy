import { describe, it, expect, beforeEach } from 'vitest'
import {
    ASSISTANT_CONFIG_KEY,
    MODEL_LARGE,
    MODEL_SMALL,
    PRESETS,
    configFromPreset,
    matchPreset,
    getStoredConfig,
    saveConfig,
} from './assistantConfig'

beforeEach(() => {
    localStorage.clear()
})

describe('configFromPreset', () => {
    it('expands a preset into its axes', () => {
        expect(configFromPreset('rich')).toEqual({
            preset: 'rich',
            modelId: MODEL_LARGE,
            chart: 'llm',
            narrative: 'stream',
            suggest: 'llm',
        })
        expect(configFromPreset('minimal')).toEqual({
            preset: 'minimal',
            modelId: MODEL_SMALL,
            chart: 'off',
            narrative: 'static',
            suggest: 'off',
        })
    })
})

describe('matchPreset', () => {
    it('recognizes each preset from its axes', () => {
        expect(matchPreset(PRESETS.rich)).toBe('rich')
        expect(matchPreset(PRESETS.balanced)).toBe('balanced')
        expect(matchPreset(PRESETS.lite)).toBe('lite')
        expect(matchPreset(PRESETS.minimal)).toBe('minimal')
    })

    it('returns custom for an off-preset combination', () => {
        expect(
            matchPreset({
                modelId: MODEL_SMALL,
                chart: 'llm',
                narrative: 'stream',
                suggest: 'llm',
            })
        ).toBe('custom')
    })

    it('treats the suggest axis as preset-defining', () => {
        expect(matchPreset({ ...PRESETS.balanced, suggest: 'off' })).toBe(
            'custom'
        )
    })
})

describe('saveConfig / getStoredConfig', () => {
    it('round-trips a config', () => {
        saveConfig(configFromPreset('balanced'))
        expect(getStoredConfig()).toEqual(configFromPreset('balanced'))
    })

    it('returns null when nothing is stored', () => {
        expect(getStoredConfig()).toBeNull()
    })

    it('returns null for malformed JSON', () => {
        localStorage.setItem(ASSISTANT_CONFIG_KEY, '{not json')
        expect(getStoredConfig()).toBeNull()
    })

    it('normalizes the preset label to match the axes on save', () => {
        // Claim "rich" but supply custom axes — the stored preset is corrected.
        saveConfig({
            preset: 'rich',
            modelId: MODEL_SMALL,
            chart: 'llm',
            narrative: 'stream',
            suggest: 'llm',
        })
        expect(getStoredConfig()?.preset).toBe('custom')
    })

    it('re-derives the preset when reading custom axes', () => {
        localStorage.setItem(
            ASSISTANT_CONFIG_KEY,
            JSON.stringify({
                modelId: MODEL_LARGE,
                chart: 'llm',
                narrative: 'static',
                suggest: 'llm',
            })
        )
        expect(getStoredConfig()?.preset).toBe('balanced')
    })

    it('defaults suggest to off for configs stored before the axis existed', () => {
        localStorage.setItem(
            ASSISTANT_CONFIG_KEY,
            JSON.stringify({
                modelId: MODEL_LARGE,
                chart: 'llm',
                narrative: 'static',
            })
        )
        // An upgrade must never silently opt an existing user into extra
        // inference on every typing pause.
        expect(getStoredConfig()?.suggest).toBe('off')
    })
})
