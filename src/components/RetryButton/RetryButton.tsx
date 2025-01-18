export function RetryButton({
    onClick,
    label = 'Try again',
}: {
    onClick: () => void
    label?: string
}) {
    return (
        <div className="flex justify-center">
            <button
                onClick={() => onClick()}
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
            >
                {label}
            </button>
        </div>
    )
}
