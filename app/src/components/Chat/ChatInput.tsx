import { useState, type KeyboardEvent } from 'react'

type ChatInputProps = {
    disabled?: boolean
    isAsking?: boolean
    placeholder?: string
    onSubmit: (text: string) => void
    onCancel?: () => void
}

export function ChatInput({
    disabled,
    isAsking,
    placeholder,
    onSubmit,
    onCancel,
}: ChatInputProps) {
    const [value, setValue] = useState('')

    const submit = () => {
        const trimmed = value.trim()
        if (!trimmed) return
        onSubmit(trimmed)
        setValue('')
    }

    const handleSubmit = (e: { preventDefault(): void }) => {
        e.preventDefault()
        submit()
    }

    const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex gap-2 p-3 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50"
        >
            <textarea
                aria-label="Ask the assistant"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKey}
                disabled={disabled}
                rows={2}
                placeholder={
                    placeholder ??
                    `Ask about your listening (e.g. top tracks in ${new Date().getFullYear()})`
                }
                className="flex-1 resize-none bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
            />
            {isAsking ? (
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gradient-brand text-white font-semibold rounded-xl shadow-glow transition-all"
                >
                    Stop
                </button>
            ) : (
                <button
                    type="submit"
                    disabled={disabled || value.trim().length === 0}
                    className="px-4 py-2 bg-gradient-brand text-white font-semibold rounded-xl shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Ask
                </button>
            )}
        </form>
    )
}
