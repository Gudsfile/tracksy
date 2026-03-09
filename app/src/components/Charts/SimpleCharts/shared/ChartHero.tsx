import type { FC } from 'react'

type Props = {
    label: string
    sublabel?: string
    emoji?: string
    labelColor?: string
}

export const ChartHero: FC<Props> = ({
    label,
    sublabel,
    emoji,
    labelColor,
}) => {
    return (
        <div className="flex items-center justify-between mb-4">
            <div>
                <div className={`text-2xl font-bold ${labelColor}`}>
                    {label}
                </div>
                {sublabel && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {sublabel}
                    </div>
                )}
            </div>
            {emoji && <div className="text-4xl">{emoji}</div>}
        </div>
    )
}
