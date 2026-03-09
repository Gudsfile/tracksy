import type { FC } from 'react'
import { ProgressBar } from './ProgressBar'

type Props = {
    label: string
    value: string
    valueColor?: string
    pct: number
    barColor?: string
}

export const LabeledProgressBar: FC<Props> = ({
    label,
    value,
    valueColor,
    pct,
    barColor,
}) => {
    return (
        <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
                <span>{label}</span>
                <span className={valueColor}>{value}</span>
            </div>
            <ProgressBar pct={pct} color={barColor} />
        </div>
    )
}
