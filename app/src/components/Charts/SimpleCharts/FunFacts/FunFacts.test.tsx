import { describe, it, vi, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { FunFacts } from '.'

import * as query from '../../../../db/queries/queryDB'
import * as db from '../../../../db/getDB'
import { DATA_LOADED_EVENT } from '../../../../db/dataSignal'
import { FunFactData, facts } from './queries'

const EMPTY_MESSAGE = 'Not enough data for this fun fact — keep listening!'
const ERROR_MESSAGE = 'Something went wrong while loading fun facts'

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
                    entity: `entity_for_${fact.fact_type}`,
                    metric: i % 2 === 0 ? 1 : undefined,
                    context_suffix: i % 2 === 0 ? undefined : 'dummy_context',
                },
            ] as FunFactData[]
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
        let callIndex = 0
        const querySpy = vi
            .spyOn(query, 'queryDBAsJSON')
            .mockImplementation(async () => {
                callIndex++
                return [
                    {
                        entity: `Test fact #${callIndex}`,
                        metric: callIndex,
                    },
                ] as FunFactData[]
            })
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

    it('should show empty state when no data is available', async () => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue([])
        render(<FunFacts />)

        await waitFor(() => {
            expect(screen.getByText(EMPTY_MESSAGE)).toBeDefined()
        })

        const hasAnyTitle = facts.some((f) => screen.queryByText(f.title))
        expect(hasAnyTitle).toBe(true)
    })

    it('should show error state when query fails', async () => {
        vi.spyOn(query, 'queryDBAsJSON').mockRejectedValue(
            new Error('DB error')
        )
        render(<FunFacts />)

        await waitFor(() => {
            expect(screen.getByText(ERROR_MESSAGE)).toBeDefined()
        })
    })

    it('should have a refresh button in error state', async () => {
        vi.spyOn(query, 'queryDBAsJSON').mockRejectedValue(
            new Error('DB error')
        )
        render(<FunFacts />)

        await waitFor(() => {
            expect(screen.getByTitle('New fact')).toBeDefined()
        })
    })

    it('should retry loading a fact after error when clicking refresh', async () => {
        const spy = vi
            .spyOn(query, 'queryDBAsJSON')
            .mockRejectedValue(new Error('DB error'))
        render(<FunFacts />)

        await waitFor(() => {
            expect(screen.getByText(ERROR_MESSAGE)).toBeDefined()
        })

        spy.mockResolvedValue([
            {
                entity: 'Test morning_favorite',
                metric: 1,
            },
        ] as FunFactData[])

        fireEvent.click(screen.getByTitle('New fact'))

        await waitFor(() => {
            expect(screen.queryByText(ERROR_MESSAGE)).toBeNull()
            const hasAnyTitle = facts.some((f) => screen.queryByText(f.title))
            expect(hasAnyTitle).toBe(true)
        })
    })

    it('should show empty state when query returns null main_text and no other content', async () => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue([
            {
                entity: null as unknown as string,
            },
        ] as FunFactData[])
        render(<FunFacts />)

        await waitFor(() => {
            expect(screen.getByText(EMPTY_MESSAGE)).toBeDefined()
        })
        const hasAnyTitle = facts.some((f) => screen.queryByText(f.title))
        expect(hasAnyTitle).toBe(true)
    })

    it('should render content when query returns main_text and value', async () => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue([
            {
                entity: 'Cozy Album',
                parent_entity: 'Cozy Artist',
                metric: 10,
            },
        ] as FunFactData[])
        render(<FunFacts />)

        await waitFor(() => {
            expect(screen.getByText('Cozy Album')).toBeDefined()
        })
        expect(
            screen.getByText((content) => content.includes('10'))
        ).toBeDefined()
    })

    it('does not show generic fallback identity when all facts are empty', async () => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue([])
        render(<FunFacts />)

        await waitFor(() => {
            const el = document.querySelector('[data-fact-type]')
            expect(el?.getAttribute('data-fact-type')).not.toBe('fallback_fact')
        })
    })

    it('displays numeric value when query returns fact_value', async () => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue([
            {
                entity: 'Some Artist',
                metric: 42,
            },
        ] as FunFactData[])
        render(<FunFacts />)

        await waitFor(() => {
            expect(
                screen.getByText((content) => content.includes('42'))
            ).toBeDefined()
        })
    })
})
