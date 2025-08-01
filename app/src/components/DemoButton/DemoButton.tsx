type DemoButtonProps = {
    label: string
    handleClick: () => void
}

export function DemoButton({ label, handleClick }: DemoButtonProps) {
    return (
        <div className="mt-4 flex justify-center">
            <button
                type="button"
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all shadow-sm"
                onClick={handleClick}
            >
                {label}
            </button>
        </div>
    )
}
