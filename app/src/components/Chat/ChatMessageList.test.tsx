import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChatMessageList } from './ChatMessageList'
import { QueryTabContext } from '../Results/QueryTabContext'
import * as ChatChartRouterModule from './ChatChartRouter'
import type { ChatAnswer, ChatMessage } from '../../llm/types'
import type { DBRow } from '../../llm/inferChartType'

// ── fixtures for Open-in-Query-tab tests ──────────────────────────────────────

const okMessage: ChatMessage = {
    id: '1',
    role: 'assistant',
    text: '',
    payload: {
        kind: 'ok',
        answer: {
            intent: 'custom',
            params: {},
            title: 'Test chart',
            explanation: 'Top streams by artist',
            sql: 'SELECT artist, count(*) FROM streams GROUP BY artist',
        },
    },
}

const llmErrorMessage: ChatMessage = {
    id: '2',
    role: 'assistant',
    text: '',
    payload: { kind: 'llm-error', error: 'Model failed to respond' },
}

const unsafeSqlMessage: ChatMessage = {
    id: '3',
    role: 'assistant',
    text: '',
    payload: {
        kind: 'unsafe-sql',
        answer: {
            intent: 'custom',
            params: {},
            title: '',
            explanation: '',
            sql: 'DROP TABLE streams',
        },
        reason: 'Unsafe SQL detected',
    },
}

describe('ChatMessageList', () => {
    beforeEach(() => {
        vi.spyOn(ChatChartRouterModule, 'ChatChartRouter').mockImplementation(
            () => <div>chart</div>
        )
    })

    it('shows the "Open in Query tab" button only for ok payloads', () => {
        render(
            <ChatMessageList
                messages={[okMessage, llmErrorMessage, unsafeSqlMessage]}
                customRows={new Map()}
            />
        )

        const buttons = screen.getAllByRole('button', {
            name: /Open in Query tab/i,
        })
        expect(buttons).toHaveLength(1)
    })

    it('does not show "Open in Query tab" button for llm-error payloads', () => {
        render(
            <ChatMessageList
                messages={[llmErrorMessage]}
                customRows={new Map()}
            />
        )

        expect(
            screen.queryByRole('button', { name: /Open in Query tab/i })
        ).toBeNull()
    })

    it('calls openInQueryTab with the answer sql when button is clicked', () => {
        const openInQueryTab = vi.fn()

        render(
            <QueryTabContext.Provider value={openInQueryTab}>
                <ChatMessageList
                    messages={[okMessage]}
                    customRows={new Map()}
                />
            </QueryTabContext.Provider>
        )

        fireEvent.click(
            screen.getByRole('button', { name: /Open in Query tab/i })
        )

        expect(openInQueryTab).toHaveBeenCalledWith(
            'SELECT artist, count(*) FROM streams GROUP BY artist'
        )
    })

    it('renders empty state when there are no messages', () => {
        render(<ChatMessageList messages={[]} customRows={new Map()} />)

        screen.getByText('Ask anything about your listening history')
    })
})

// ── fixtures for unified SQL rendering tests ──────────────────────────────────

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
        // Separator varies by locale: "1,550", "1.550", "1 550"…
        expect(screen.getByText(/1[,.\s]?550/)).toBeTruthy()

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
