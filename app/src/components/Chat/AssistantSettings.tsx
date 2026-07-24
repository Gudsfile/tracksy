import { useEffect, useMemo, useRef, useState } from 'react'
import {
    PRESET_NAMES,
    PRESET_LABELS,
    PRESETS,
    MODEL_LARGE,
    MODEL_SMALL,
    matchPreset,
    type AssistantConfig,
    type ChartMode,
    type NarrativeMode,
    type PresetName,
} from '../../llm/assistantConfig'
import type { ModelInfo } from '../../llm/engine'
import { recommendPreset } from '../../llm/recommendPreset'

type Axes = Pick<AssistantConfig, 'modelId' | 'chart' | 'narrative'>

type Props = {
    mode: 'onboarding' | 'settings'
    /** Current config, for the settings panel. */
    initialConfig?: AssistantConfig | null
    onSubmit: (config: AssistantConfig) => void
    onCancel?: () => void
}

const KNOWN_GOOD = new Set([MODEL_LARGE, MODEL_SMALL])

const CHART_LABELS: Record<ChartMode, string> = {
    llm: 'AI-picked chart',
    infer: 'Quick chart (heuristic)',
    off: 'Table only',
}

const NARRATIVE_LABELS: Record<NarrativeMode, string> = {
    stream: 'Written insights (AI)',
    static: 'Plain summary',
}

function formatSize(vramMB?: number): string {
    if (!vramMB) return ''
    return vramMB >= 1024
        ? `~${(vramMB / 1024).toFixed(1)} GB`
        : `~${Math.round(vramMB)} MB`
}

export function AssistantSettings({
    mode,
    initialConfig,
    onSubmit,
    onCancel,
}: Props) {
    const initialAxes: Axes = initialConfig
        ? {
              modelId: initialConfig.modelId,
              chart: initialConfig.chart,
              narrative: initialConfig.narrative,
          }
        : PRESETS.balanced

    const [axes, setAxes] = useState<Axes>(initialAxes)
    const [recommended, setRecommended] = useState<PresetName | null>(null)
    // In onboarding we defer enabling until the device probe resolves, so a fast
    // click can't skip the recommended default and load too heavy a model.
    const [recommending, setRecommending] = useState(mode === 'onboarding')
    const [advancedOpen, setAdvancedOpen] = useState(false)
    const [models, setModels] = useState<ModelInfo[]>([])
    // Once the user picks anything, stop auto-applying the recommendation.
    const touchedRef = useRef(mode === 'settings')

    const selectedPreset = useMemo(() => matchPreset(axes), [axes])

    // Compute the device recommendation for onboarding and pre-select it.
    useEffect(() => {
        if (mode !== 'onboarding') return
        let cancelled = false
        recommendPreset()
            .then((preset) => {
                if (cancelled) return
                const name = preset === 'custom' ? 'balanced' : preset
                setRecommended(name)
                if (!touchedRef.current) setAxes(PRESETS[name])
            })
            .catch(() => {
                // recommendPreset isn't written to reject, but keep the default
                // balanced selection rather than surface an unhandled rejection.
            })
            .finally(() => {
                if (!cancelled) setRecommending(false)
            })
        return () => {
            cancelled = true
        }
    }, [mode])

    // Lazy-load the model catalog only when Advanced is opened, so
    // @mlc-ai/web-llm stays out of the main bundle.
    useEffect(() => {
        if (!advancedOpen || models.length > 0) return
        let cancelled = false
        import('../../llm/engine').then((mod) => {
            if (!cancelled) setModels(mod.listModels())
        })
        return () => {
            cancelled = true
        }
    }, [advancedOpen, models.length])

    function choosePreset(name: PresetName) {
        touchedRef.current = true
        setAxes(PRESETS[name])
    }

    function updateAxis<K extends keyof Axes>(key: K, value: Axes[K]) {
        touchedRef.current = true
        setAxes((prev) => ({ ...prev, [key]: value }))
    }

    function submit() {
        onSubmit({ preset: selectedPreset, ...axes })
    }

    const modelUnverified = !KNOWN_GOOD.has(axes.modelId)
    const modelChanged =
        mode === 'settings' && initialConfig?.modelId !== axes.modelId
    // Prefer the real weight size from the catalogue (only loaded once Advanced
    // is opened); otherwise fall back to generic phrasing.
    const selectedModelSize = formatSize(
        models.find((m) => m.id === axes.modelId)?.vramMB
    )

    return (
        <div className="p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100">
            <h3 className="text-lg font-semibold mb-1">
                {mode === 'onboarding'
                    ? '💬 How should the assistant run?'
                    : '⚙️ Assistant settings'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Everything runs locally in your browser. Pick a profile — one is
                recommended for your device.
            </p>

            <fieldset className="space-y-2 mb-4">
                <legend className="sr-only">Assistant profile</legend>
                {PRESET_NAMES.map((name) => {
                    const isSelected = selectedPreset === name
                    const isRecommended = recommended === name
                    return (
                        <label
                            key={name}
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                isSelected
                                    ? 'border-brand-purple bg-brand-purple/5'
                                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                            }`}
                        >
                            <input
                                type="radio"
                                name="assistant-preset"
                                className="mt-1 accent-brand-purple"
                                checked={isSelected}
                                onChange={() => choosePreset(name)}
                            />
                            <span className="flex-1">
                                <span className="flex items-center gap-2">
                                    <span className="font-medium">
                                        {PRESET_LABELS[name].title}
                                    </span>
                                    {isRecommended && (
                                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-brand-purple/15 text-brand-purple font-medium">
                                            Recommended
                                        </span>
                                    )}
                                </span>
                                <span className="block text-sm text-gray-600 dark:text-gray-400">
                                    {PRESET_LABELS[name].summary}
                                </span>
                            </span>
                        </label>
                    )
                })}
            </fieldset>

            <details
                open={advancedOpen}
                onToggle={(e) =>
                    setAdvancedOpen((e.target as HTMLDetailsElement).open)
                }
                className="mb-4"
            >
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 select-none">
                    Advanced
                    {selectedPreset === 'custom' && ' · custom'}
                </summary>
                <div className="mt-3 space-y-3">
                    <label className="block text-sm">
                        <span className="block mb-1 text-gray-600 dark:text-gray-400">
                            Model
                        </span>
                        <select
                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                            value={axes.modelId}
                            onChange={(e) =>
                                updateAxis('modelId', e.target.value)
                            }
                        >
                            {models.length === 0 && (
                                <option value={axes.modelId}>
                                    {axes.modelId}
                                </option>
                            )}
                            {models.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.id}
                                    {m.vramMB
                                        ? ` — ${formatSize(m.vramMB)}`
                                        : ''}
                                    {KNOWN_GOOD.has(m.id)
                                        ? ''
                                        : ' (unverified)'}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block text-sm">
                        <span className="block mb-1 text-gray-600 dark:text-gray-400">
                            Chart
                        </span>
                        <select
                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                            value={axes.chart}
                            onChange={(e) =>
                                updateAxis('chart', e.target.value as ChartMode)
                            }
                        >
                            {(['llm', 'infer', 'off'] as ChartMode[]).map(
                                (c) => (
                                    <option key={c} value={c}>
                                        {CHART_LABELS[c]}
                                    </option>
                                )
                            )}
                        </select>
                    </label>

                    <label className="block text-sm">
                        <span className="block mb-1 text-gray-600 dark:text-gray-400">
                            Narrative
                        </span>
                        <select
                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                            value={axes.narrative}
                            onChange={(e) =>
                                updateAxis(
                                    'narrative',
                                    e.target.value as NarrativeMode
                                )
                            }
                        >
                            {(['stream', 'static'] as NarrativeMode[]).map(
                                (n) => (
                                    <option key={n} value={n}>
                                        {NARRATIVE_LABELS[n]}
                                    </option>
                                )
                            )}
                        </select>
                    </label>

                    {modelUnverified && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                            ⚠️ This model isn't verified with Tracksy's prompts
                            — answers may be unreliable.
                        </p>
                    )}
                </div>
            </details>

            {modelChanged && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Changing the model will re-download the new weights.
                </p>
            )}

            <div className="flex items-center gap-3">
                <button
                    onClick={submit}
                    disabled={recommending}
                    className="px-4 py-2 bg-gradient-brand text-white font-semibold rounded-xl shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {recommending
                        ? 'Checking your device…'
                        : mode === 'onboarding'
                          ? 'Enable assistant'
                          : 'Apply'}
                </button>
                {mode === 'settings' && onCancel && (
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {mode === 'onboarding' && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                    First enable downloads{' '}
                    {selectedModelSize || 'the model weights'}; afterwards
                    everything works offline. You can change this later.
                </p>
            )}
        </div>
    )
}
