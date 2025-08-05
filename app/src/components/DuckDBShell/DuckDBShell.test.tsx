import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DuckDBShell } from './DuckDBShell'
import * as db from '../../db/getDB'

describe('DuckDBShell', () => {
    const mockQuery = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()

        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: {
                query: mockQuery,
            },
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

    it('should render the component with default query', () => {
        render(<DuckDBShell />)

        screen.getByText('⌨️ DuckDB Shell')
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
        expect(textarea.value).toBe(
            'SELECT 42 AS answer;\n-- tips: use `show tables` to… show tables'
        )
        screen.getByRole('button', { name: /Run query/i })
    })

    it('should update query when typing in textarea', () => {
        render(<DuckDBShell />)

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
        fireEvent.change(textarea, { target: { value: 'SELECT * FROM test' } })

        expect(textarea.value).toBe('SELECT * FROM test')
    })

    it('should display loading state when running query', async () => {
        // Mock a slow query
        mockQuery.mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(
                        () =>
                            resolve({
                                schema: {
                                    fields: [{ name: 'answer' }],
                                },
                                toArray: () => [{ answer: 42 }],
                            }),
                        100
                    )
                )
        )

        render(<DuckDBShell />)

        const button = screen.getByRole('button', { name: /Run query/i })
        fireEvent.click(button)

        // Should show loading state
        await waitFor(() => {
            screen.getByText('Run in progress…')
        })
    })

    it('should display results when query succeeds', async () => {
        mockQuery.mockResolvedValue({
            schema: {
                fields: [{ name: 'answer' }, { name: 'question' }],
            },
            toArray: () => [
                { answer: 42, question: 'What is the meaning of life?' },
                { answer: 24, question: 'What is the reverse?' },
            ],
        })

        render(<DuckDBShell />)

        const button = screen.getByRole('button', { name: /Run query/i })
        fireEvent.click(button)

        // Wait for results to appear
        await waitFor(() => {
            // Check table headers
            screen.getByText('answer')
            screen.getByText('question')

            // Check table data
            screen.getByText('42')
            screen.getByText('What is the meaning of life?')
            screen.getByText('24')
            screen.getByText('What is the reverse?')
        })
    })

    it('should display error when query fails', async () => {
        mockQuery.mockRejectedValue(new Error('Syntax error in SQL'))

        render(<DuckDBShell />)

        const button = screen.getByRole('button', { name: /Run query/i })
        fireEvent.click(button)

        // Wait for error to appear
        await waitFor(() => {
            screen.getByText(/SQL Error: Syntax error in SQL/i)
        })
    })

    it('should display unknown error when error is not an Error instance', async () => {
        mockQuery.mockRejectedValue('Some string error')

        render(<DuckDBShell />)

        const button = screen.getByRole('button', { name: /Run query/i })
        fireEvent.click(button)

        // Wait for error to appear
        await waitFor(() => {
            screen.getByText(/SQL Error: Unknown error/i)
        })
    })

    it('should display error when query returns no result', async () => {
        mockQuery.mockResolvedValue(null)

        render(<DuckDBShell />)

        const button = screen.getByRole('button', { name: /Run query/i })
        fireEvent.click(button)

        // Wait for error to appear
        await waitFor(() => {
            screen.getByText(/SQL Error: No result/i)
        })
    })

    it('should add query to history after successful execution', async () => {
        mockQuery.mockResolvedValue({
            schema: {
                fields: [{ name: 'answer' }],
            },
            toArray: () => [{ answer: 42 }],
        })

        render(<DuckDBShell />)

        const button = screen.getByRole('button', { name: /Run query/i })
        fireEvent.click(button)

        // Wait for query to complete
        await waitFor(() => {
            screen.getByText('42')
        })

        // Check that history section appears
        screen.getByText('Query history (max 20)')
        screen.getByRole('button', {
            name: /^SELECT 42 AS answer;\n-- tips: use `show tables` to… show tables$/i,
        })
    })

    it('should not add query to history when query fails', async () => {
        mockQuery.mockRejectedValue(new Error('Syntax error'))

        render(<DuckDBShell />)

        const button = screen.getByRole('button', { name: /Run query/i })
        fireEvent.click(button)

        // Wait for error to appear
        await waitFor(() => {
            screen.getByText(/SQL Error: Syntax error/i)
        })

        // History should not appear
        expect(screen.queryByText('Query history (max 20)')).toBeNull()
    })

    it('should load query from history when clicking on history item', async () => {
        mockQuery.mockResolvedValue({
            schema: {
                fields: [{ name: 'answer' }],
            },
            toArray: () => [{ answer: 42 }],
        })

        render(<DuckDBShell />)

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
        const button = screen.getByRole('button', { name: /Run query/i })

        // Run first query
        fireEvent.click(button)

        await waitFor(() => {
            screen.getByText('Query history (max 20)')
        })

        // Change query
        fireEvent.change(textarea, { target: { value: 'SELECT 1' } })
        expect(textarea.value).toBe('SELECT 1')

        // Click on history item
        const historyButton = screen.getByRole('button', {
            name: /SELECT 42 AS answer/i,
        })
        fireEvent.click(historyButton)

        // Query should be restored
        expect(textarea.value).toBe(
            'SELECT 42 AS answer;\n-- tips: use `show tables` to… show tables'
        )
    })

    it('should keep only last 20 unique queries in history', async () => {
        mockQuery.mockResolvedValue({
            schema: {
                fields: [{ name: 'answer' }],
            },
            toArray: () => [{ answer: 42 }],
        })

        render(<DuckDBShell />)

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
        const button = screen.getByRole('button', { name: /Run query/i })

        // Run 22 different queries
        for (let i = 0; i < 22; i++) {
            fireEvent.change(textarea, { target: { value: `SELECT ${i}` } })
            fireEvent.click(button)
            await waitFor(() => screen.getByText('42'))
        }

        // Check that only 20 queries are in history
        const historyItems = screen.getAllByRole('listitem')
        expect(historyItems).toHaveLength(20)

        // The first query (SELECT 0) should not be in history
        expect(screen.queryByRole('button', { name: /SELECT 0/i })).toBeNull()

        // The last query (SELECT 21) should be in history
        screen.getByRole('button', { name: /SELECT 21/i })
    })

    it('should not duplicate queries in history', async () => {
        mockQuery.mockResolvedValue({
            schema: {
                fields: [{ name: 'answer' }],
            },
            toArray: () => [{ answer: 42 }],
        })

        render(<DuckDBShell />)

        const button = screen.getByRole('button', { name: /Run query/i })

        // Run the same query twice
        fireEvent.click(button)
        await waitFor(() => screen.getByText('42'))

        fireEvent.click(button)
        await waitFor(() => screen.getByText('42'))

        // Check that only one history item exists
        const historyItems = screen.getAllByRole('listitem')
        expect(historyItems).toHaveLength(1)
    })

    it('should truncate long queries in history display', async () => {
        const longQuery = 'SELECT ' + 'a'.repeat(100) + ' FROM test'

        mockQuery.mockResolvedValue({
            schema: {
                fields: [{ name: 'answer' }],
            },
            toArray: () => [{ answer: 42 }],
        })

        render(<DuckDBShell />)

        const textarea = screen.getByRole('textbox')
        const button = screen.getByRole('button', { name: /Run query/i })

        fireEvent.change(textarea, { target: { value: longQuery } })
        fireEvent.click(button)

        await waitFor(() => {
            screen.getByText('Query history (max 20)')
        })

        // Check that the query is truncated with ellipsis
        screen.getByRole('button', {
            name: new RegExp(longQuery.slice(0, 80) + '…'),
        })
    })

    it('should display only 1000 rows in the table', async () => {
        mockQuery.mockResolvedValue({
            schema: {
                fields: [{ name: 'answer' }],
            },
            toArray: () =>
                Array.from({ length: 1001 }, (_, i) => ({ answer: i })),
            numRows: 1001,
        })

        render(<DuckDBShell />)

        const button = screen.getByRole('button', { name: /Run query/i })
        fireEvent.click(button)

        await waitFor(() => {
            screen.getByText('1000 / 1001 rows displayed')
            const resultTable = screen.getByRole('table')
            const rows = resultTable.querySelectorAll('tbody tr')
            expect(rows).toHaveLength(1000)
        })
    })
})
