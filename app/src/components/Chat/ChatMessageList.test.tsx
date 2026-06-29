import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChatMessageList } from './ChatMessageList'
import { QueryTabContext } from '../Results/QueryTabContext'
import * as ChatChartRouterModule from './ChatChartRouter'
import type { ChatMessage } from '../../llm/types'

beforeEach(() => {
    vi.spyOn(ChatChartRouterModule, 'ChatChartRouter').mockImplementation(
        () => <div>chart</div>
    )
})

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
