/**
 * User-chosen configuration for the local chat assistant.
 *
 * This module is intentionally free of any `@mlc-ai/web-llm` import so it can be
 * pulled into the main bundle (hook + UI) without dragging the engine along —
 * the heavy engine module stays lazily imported (see `useChatEngine`).
 */

/** Larger, more capable model — used by the Rich / Balanced presets. */
export const MODEL_LARGE = 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC'
/** Small model with the lightest download — used by Lite / Minimal. */
export const MODEL_SMALL = 'Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC'

/**
 * How the chart is produced from the executed SQL rows:
 * - `llm`   — ChartAgent (`askChartConfig`) picks the chart type.
 * - `infer` — free heuristic (`inferConfig`), no LLM call.
 * - `off`   — render the rows as a plain table.
 */
export type ChartMode = 'llm' | 'infer' | 'off'

/**
 * How the textual summary is produced:
 * - `stream` — NarratorAgent (`askNarrator`) streams a written observation.
 * - `static` — show the deterministic `explanation` from the SQL answer.
 */
export type NarrativeMode = 'stream' | 'static'

export const PRESET_NAMES = ['rich', 'balanced', 'lite', 'minimal'] as const
export type PresetName = (typeof PRESET_NAMES)[number]
/** A preset name, or `custom` when the axes don't match any preset. */
export type AssistantPreset = PresetName | 'custom'

export type AssistantConfig = {
    preset: AssistantPreset
    modelId: string
    chart: ChartMode
    narrative: NarrativeMode
}

type PresetAxes = Omit<AssistantConfig, 'preset'>

export const PRESETS: Record<PresetName, PresetAxes> = {
    rich: { modelId: MODEL_LARGE, chart: 'llm', narrative: 'stream' },
    balanced: { modelId: MODEL_LARGE, chart: 'llm', narrative: 'static' },
    lite: { modelId: MODEL_SMALL, chart: 'infer', narrative: 'static' },
    minimal: { modelId: MODEL_SMALL, chart: 'off', narrative: 'static' },
}

export const PRESET_LABELS: Record<
    PresetName,
    { title: string; summary: string }
> = {
    rich: {
        title: 'Rich',
        summary: 'Best charts and written insights. Needs a capable device.',
    },
    balanced: {
        title: 'Balanced',
        summary: 'Smart charts, no written insights. Good default.',
    },
    lite: {
        title: 'Lite',
        summary: 'Smaller model, quick charts, plain summaries.',
    },
    minimal: {
        title: 'Minimal',
        summary: 'Answers as a table only. Lightest on memory.',
    },
}

export const ASSISTANT_CONFIG_KEY = 'tracksy:assistantConfig'

/** Build a full config from a preset name. */
export function configFromPreset(preset: PresetName): AssistantConfig {
    return { preset, ...PRESETS[preset] }
}

/** Identify which preset (if any) a set of axes corresponds to. */
export function matchPreset(axes: PresetAxes): AssistantPreset {
    for (const name of PRESET_NAMES) {
        const p = PRESETS[name]
        if (
            p.modelId === axes.modelId &&
            p.chart === axes.chart &&
            p.narrative === axes.narrative
        ) {
            return name
        }
    }
    return 'custom'
}

function isChartMode(v: unknown): v is ChartMode {
    return v === 'llm' || v === 'infer' || v === 'off'
}

/** Read the persisted config, or `null` if the user hasn't chosen one yet. */
export function getStoredConfig(): AssistantConfig | null {
    if (typeof window === 'undefined') return null
    try {
        const raw = localStorage.getItem(ASSISTANT_CONFIG_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as Partial<AssistantConfig>
        if (typeof parsed.modelId !== 'string') return null
        const axes: PresetAxes = {
            modelId: parsed.modelId,
            chart: isChartMode(parsed.chart) ? parsed.chart : 'infer',
            narrative: parsed.narrative === 'stream' ? 'stream' : 'static',
        }
        return { ...axes, preset: matchPreset(axes) }
    } catch {
        return null
    }
}

/** Persist the config, normalizing `preset` to match its axes. */
export function saveConfig(config: AssistantConfig): void {
    if (typeof window === 'undefined') return
    const axes: PresetAxes = {
        modelId: config.modelId,
        chart: config.chart,
        narrative: config.narrative,
    }
    const normalized: AssistantConfig = { ...axes, preset: matchPreset(axes) }
    localStorage.setItem(ASSISTANT_CONFIG_KEY, JSON.stringify(normalized))
}
