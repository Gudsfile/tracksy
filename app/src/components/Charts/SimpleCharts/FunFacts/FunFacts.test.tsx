import { describe, it, vi, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { FunFacts } from '.'

import * as query from '../../../../db/queries/queryDB'
import * as db from '../../../../db/getDB'
import { DATA_LOADED_EVENT } from '../../../../db/dataSignal'
import { FunFactResult, facts } from './queries'

describe('FunFacts Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        let i = 0

        vi.spyOn(query, 'queryDBAsJSON').mockImplementation(async (_sql) => {
            void _sql
            const fact = facts[i % facts.length]
            i++
            return [
                {
                    fact_type: fact.fact_type,
                    main_text: `main_text_for_${fact.fact_type}`,
                    value: i % 2 === 0 ? 1 : 'one',
                    context: i % 2 === 0 ? undefined : 'dummy_context',
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
            const hasAnyTitle = facts.some((f) => screen.queryByText(f.title))
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
        render(<FunFacts />)

        await waitFor(() => {
            expect(screen.getByTitle('New fact')).toBeDefined()
        })

        const el = document.querySelector('[data-fact-type]')
        const firstFactType = el?.getAttribute('data-fact-type')
        expect(firstFactType).toBeTruthy()

        fireEvent.click(screen.getByTitle('New fact'))

        await waitFor(() => {
            const el = document.querySelector('[data-fact-type]')
            const secondFactType = el?.getAttribute('data-fact-type')
            expect(secondFactType).not.toBe(firstFactType)
        })
        expect(query.queryDBAsJSON).toHaveBeenCalledTimes(2)
    })

    it('repeats facts after full cycle reset', async () => {
        const seen = new Set<string>()

        render(<FunFacts />)

        const button = await screen.findByTitle('New fact')

        for (let i = 0; i < facts.length * 2; i++) {
            fireEvent.click(button)

            await waitFor(() => {
                const el = document.querySelector('[data-fact-type]')
                const factType = el?.getAttribute('data-fact-type')

                expect(factType).toBeTruthy()
                seen.add(factType!)
            })
        }

        expect(seen.size).toBe(facts.length)
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
