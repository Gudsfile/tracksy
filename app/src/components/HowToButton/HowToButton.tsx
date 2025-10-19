type DemoButtonProps = {
    label: string
    tooltip: string
}

export function HowToButton({ label, tooltip }: DemoButtonProps) {
    const howToGuideUrl =
        'https://github.com/Gudsfile/tracksy?tab=readme-ov-file#%EF%B8%8F-download-your-data'

    return (
        <a
            href={howToGuideUrl}
            title={tooltip}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm text-blue-600 dark:text-blue-400 bg-gray-50/50 dark:bg-gray-800/20 transition-all duration-300"
        >
            <span className="whitespace-nowrap">{label}</span>
        </a>
    )
}
