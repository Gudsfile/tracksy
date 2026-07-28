import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatInput } from './ChatInput'

/** Wires the controlled value up the way ChatView does. */
function Harness({
    onSubmit,
    onChange,
}: {
    onSubmit: (text: string) => void
    onChange?: (text: string) => void
}) {
    const [value, setValue] = useState('')
    return (
        <ChatInput
            value={value}
            onChange={(next) => {
                setValue(next)
                onChange?.(next)
            }}
            onSubmit={onSubmit}
        />
    )
}

function typeInto(text: string) {
    const textarea = screen.getByLabelText('Ask the assistant')
    fireEvent.change(textarea, { target: { value: text } })
    return textarea as HTMLTextAreaElement
}

describe('ChatInput', () => {
    it('reports the draft on every change', () => {
        const onChange = vi.fn()
        render(<Harness onSubmit={vi.fn()} onChange={onChange} />)

        typeInto('what do i')
        expect(onChange).toHaveBeenLastCalledWith('what do i')

        typeInto('what do i listen to')
        expect(onChange).toHaveBeenLastCalledWith('what do i listen to')
    })

    it('clears the textarea after submitting', () => {
        const onSubmit = vi.fn()
        const onChange = vi.fn()
        render(<Harness onSubmit={onSubmit} onChange={onChange} />)

        const textarea = typeInto('top artists')
        fireEvent.keyDown(textarea, { key: 'Enter' })

        expect(onSubmit).toHaveBeenCalledWith('top artists')
        expect(onChange).toHaveBeenLastCalledWith('')
        expect(textarea.value).toBe('')
    })

    it('does not report a reset when an empty submit is ignored', () => {
        const onChange = vi.fn()
        render(<Harness onSubmit={vi.fn()} onChange={onChange} />)

        const textarea = typeInto('   ')
        onChange.mockClear()
        fireEvent.keyDown(textarea, { key: 'Enter' })

        expect(onChange).not.toHaveBeenCalled()
    })

    it('renders whatever value the parent owns', () => {
        const onChange = vi.fn()
        render(
            <ChatInput
                value="set from above"
                onChange={onChange}
                onSubmit={vi.fn()}
            />
        )

        const textarea = screen.getByLabelText(
            'Ask the assistant'
        ) as HTMLTextAreaElement
        expect(textarea.value).toBe('set from above')
    })
})
