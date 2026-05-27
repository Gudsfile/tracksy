import type { EntityType } from './types'

const LABELS: Record<EntityType, string> = {
    artists: 'Artists',
    tracks: 'Tracks',
    albums: 'Albums',
}

type Props = {
    value: EntityType
    onChange: (type: EntityType) => void
}

export function EntityTabs({ value, onChange }: Props) {
    return (
        <div className="flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30">
            {(['artists', 'tracks', 'albums'] as const).map((type) => (
                <button
                    key={type}
                    onClick={() => onChange(type)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                        value === type
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    {LABELS[type]}
                </button>
            ))}
        </div>
    )
}
