import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatMessageList } from './ChatMessageList'
import type { ChatAnswer, ChatMessage } from '../../llm/types'
import type { DBRow } from '../../llm/inferChartType'

const answer: ChatAnswer = {
    intent: 'total_streams',
    params: { year: 2025 },
    title: 'Tracks in 2025',
    explanation: 'Total number of tracks streamed in 2025.',
    sql: 'SELECT COUNT(*) AS total_streams FROM music_streams WHERE EXTRACT(year FROM ts) = 2025',
}

function okMessages(
    rows: DBRow[],
    narrative?: string
): { messages: ChatMessage[]; customRows: Map<string, DBRow[]> } {
    const messages: ChatMessage[] = [
        { id: 'u1', role: 'user', text: 'how many tracks in 2025?' },
        {
            id: 'a1',
            role: 'assistant',
            text: '',
            payload: { kind: 'ok', answer, narrative },
        },
    ]
    return { messages, customRows: new Map([['a1', rows]]) }
}

describe('ChatMessageList (unified SQL rendering)', () => {
    it('renders a chart from the executed rows and shows the generated SQL collapsed', () => {
        const { messages, customRows } = okMessages([{ total_streams: 1550 }])
        const { container } = render(
            <ChatMessageList messages={messages} customRows={customRows} />
        )

        // CustomChart rendered the metric from the rows (not a preset chart).
        expect(screen.getByText('total_streams')).toBeTruthy()
        expect(screen.getByText(/1[,.]?550/)).toBeTruthy()

        // The generated SQL is shown but collapsed by default.
        const details = container.querySelector('details')
        expect(details).toBeTruthy()
        expect(details?.hasAttribute('open')).toBe(false)
        expect(screen.getByText('🔍 Generated SQL')).toBeTruthy()
    })

    it('falls back to the static explanation when no narrative is present (mobile)', () => {
        const { messages, customRows } = okMessages([{ total_streams: 1550 }])
        render(<ChatMessageList messages={messages} customRows={customRows} />)

        expect(
            screen.getByText('Total number of tracks streamed in 2025.')
        ).toBeTruthy()
    })

    it('shows the settled LLM narrative when present (desktop)', () => {
        const { messages, customRows } = okMessages(
            [{ total_streams: 1550 }],
            'You streamed 1,550 tracks in 2025.'
        )
        render(<ChatMessageList messages={messages} customRows={customRows} />)

        expect(
            screen.getByText('You streamed 1,550 tracks in 2025.')
        ).toBeTruthy()
        // The static explanation is replaced by the narrative.
        expect(
            screen.queryByText('Total number of tracks streamed in 2025.')
        ).toBeNull()
    })

    it('shows "No results found" and not the explanation when SQL returned empty rows', () => {
        const { messages, customRows } = okMessages([])
        render(<ChatMessageList messages={messages} customRows={customRows} />)

        expect(
            screen.getByText('No results found for this query.')
        ).toBeTruthy()
        expect(
            screen.queryByText('Total number of tracks streamed in 2025.')
        ).toBeNull()
    })

    it('renders a Retry button on sql-error that re-submits the preceding question', () => {
        const onRetry = vi.fn()
        const messages: ChatMessage[] = [
            { id: 'u1', role: 'user', text: 'how many tracks in 2025?' },
            {
                id: 'a1',
                role: 'assistant',
                text: '',
                payload: { kind: 'sql-error', answer, error: 'Binder Error' },
            },
        ]
        render(
            <ChatMessageList
                messages={messages}
                customRows={new Map()}
                onRetry={onRetry}
            />
        )

        fireEvent.click(screen.getByText('↺ Retry'))
        expect(onRetry).toHaveBeenCalledWith('how many tracks in 2025?')
    })
})
