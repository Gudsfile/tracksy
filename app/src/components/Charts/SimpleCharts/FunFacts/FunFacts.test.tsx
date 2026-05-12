import { describe, it, vi, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { FunFacts } from '.'

import * as query from '../../../../db/queries/queryDB'
import * as db from '../../../../db/getDB'
import { DATA_LOADED_EVENT } from '../../../../db/dataSignal'
import { FunFactResult, facts } from './queries'

const EMPTY_MESSAGE =
    'Not enough listening data to generate fun facts — keep streaming!'
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
        let callIndex = 0
        const querySpy = vi
            .spyOn(query, 'queryDBAsJSON')
            .mockImplementation(async (sql: string) => {
                const match = sql.match(/'([a-z_]+)'\s+as\s+fact_type/)
                if (!match) return []
                callIndex++
                return [
                    {
                        fact_type: match[1],
                        main_text: `Test ${match[1]} #${callIndex}`,
                        value: callIndex,
                        unit: 'streams',
                    },
                ] as FunFactResult[]
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
                fact_type: 'morning_favorite',
                main_text: 'Test morning_favorite',
                value: 1,
                unit: 'streams',
            },
        ] as FunFactResult[])

        fireEvent.click(screen.getByTitle('New fact'))

        await waitFor(() => {
            expect(screen.getByText('🌅 Musical Breakfast')).toBeDefined()
        })
    })

    it('should handle cozy album with null main_text', async () => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue([
            {
                fact_type: 'cozy_album',
                main_text: null,
                second_text: 'This fun fact is unfortunately unavailable',
                value: undefined,
                context: 'feel like listening to an album today?',
            },
        ] as FunFactResult[])
        render(<FunFacts />)

        await waitFor(() => {
            expect(
                screen.getByText('This fun fact is unfortunately unavailable')
            ).toBeDefined()
        })
    })

    it('should show cozy album title when rendering', async () => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue([
            {
                fact_type: 'cozy_album',
                main_text: 'Cozy Album',
                second_text: 'Cozy Artist',
                value: 10,
                unit: 'streams',
                context:
                    'the album that wraps your Sundays in musical coziness',
            },
        ] as FunFactResult[])
        render(<FunFacts />)

        await waitFor(() => {
            expect(screen.getByText('💿 Cozy Album')).toBeDefined()
        })
        expect(screen.getByText('Cozy Album')).toBeDefined()
        expect(
            screen.getByText((content) => content.includes('10'))
        ).toBeDefined()
    })
})
