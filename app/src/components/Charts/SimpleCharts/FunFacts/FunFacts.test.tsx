import { describe, it, vi, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { FunFacts } from '.'

import * as query from '../../../../db/queries/queryDB'
import * as db from '../../../../db/getDB'
import { DATA_LOADED_EVENT } from '../../../../db/dataSignal'
import { FunFactResult, queryDefinitions } from './queries'

describe('FunFacts Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        let i = 0

        vi.spyOn(query, 'queryDBAsJSON').mockImplementation(async (_sql) => {
            void _sql
            const queryName = queryDefinitions[i % queryDefinitions.length].name
            i++
            return [
                {
                    fact_type: 'dummy_fact',
                    main_text: queryName,
                    value: 1,
                },
            ] as FunFactResult[]
        })

        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

    it('should render a fun fact', async () => {
        render(<FunFacts />)

        await waitFor(() => {
            const hasAnyTitle = queryDefinitions.some((q) =>
                screen.queryByText(q.name)
            )
            expect(hasAnyTitle).toBe(true)
        })

        expect(query.queryDBAsJSON).toHaveBeenCalled()
    })

    it('should have a refresh button', async () => {
        render(<FunFacts />)

        await waitFor(() => {
            expect(screen.getByTitle('New fact')).toBeDefined()
        })
    })

    it('should refresh fact on DATA_LOADED_EVENT', async () => {
        const querySpy = vi.spyOn(query, 'queryDBAsJSON')
        const { container } = render(<FunFacts />)

        await waitFor(() => {
            expect(container.textContent).toBeTruthy()
        })

        const first = container.textContent
        const calls = querySpy.mock.calls.length

        act(() => {
            window.dispatchEvent(new CustomEvent(DATA_LOADED_EVENT))
        })

        await waitFor(() => {
            expect(querySpy.mock.calls.length).toBeGreaterThan(calls)
        })

        expect(container.textContent).not.toBe(first)
    })

    it('refreshes fact when clicking button', async () => {
        const { container } = render(<FunFacts />)

        await waitFor(() => {
            expect(screen.getByTitle('New fact')).toBeDefined()
        })

        const first = container.textContent

        fireEvent.click(screen.getByTitle('New fact'))

        await waitFor(() => {
            expect(container.textContent).not.toBe(first)
        })
    })

    it('repeats facts after full cycle reset', async () => {
        const seen = new Set<string>()

        render(<FunFacts />)

        await waitFor(() => {
            expect(screen.getByTitle('New fact')).toBeDefined()
        })

        const button = screen.getByTitle('New fact')

        for (let i = 0; i < queryDefinitions.length * 2; i++) {
            fireEvent.click(button)

            await waitFor(() => {
                seen.add(document.body.textContent ?? '')
            })
        }

        expect(seen.size).toBe(queryDefinitions.length)
    })

    it('logs error when loading fun fact fails', async () => {
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        vi.spyOn(query, 'queryDBAsJSON').mockRejectedValue(
            new Error('DB failure')
        )

        render(<FunFacts />)

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error loading fun fact:',
                expect.any(Error)
            )
        })

        consoleSpy.mockRestore()
    })
})
