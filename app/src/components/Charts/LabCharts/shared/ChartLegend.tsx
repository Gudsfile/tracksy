type LegendItem = {
    color: string
    label: string
}

type Props = {
    items: LegendItem[]
}

export function ChartLegend({ items }: Props) {
    return (
        <div className="mt-1 mb-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {items.map(({ color, label }) => (
                <span key={label} className="flex items-center gap-1">
                    <span
                        className={`inline-block w-2 h-2 rounded-sm ${color}`}
                    />
                    {label}
                </span>
            ))}
        </div>
    )
}
