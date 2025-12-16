type DemoButtonProps = {
    label: string
    tooltip: string
    handleClick: () => void
}

export function DemoButton({ label, tooltip, handleClick }: DemoButtonProps) {
    return (
        <button
            type="button"
            title={tooltip}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-300/60 dark:border-slate-700/50 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200"
            onClick={handleClick}
        >
            <span className="whitespace-nowrap">{label}</span>
        </button>
    )
}
