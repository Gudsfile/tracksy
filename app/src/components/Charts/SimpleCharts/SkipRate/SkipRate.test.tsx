import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkipRate } from './SkipRate'

describe('SkipRate Component', () => {
    it('renders empty state when data is undefined', () => {
        render(<SkipRate data={undefined} isLoading={false} />)
        screen.getByText('No data for this year')
    })

    it('renders empty state when all values are zero', () => {
        render(
            <SkipRate
                data={{ complete_listens: 0, skipped_listens: 0 }}
                isLoading={false}
            />
        )
        screen.getByText('No data for this year')
    })

    it('renders correctly with data', async () => {
        const data = { complete_listens: 80, skipped_listens: 20 }

        render(<SkipRate data={data} />)

        screen.getByRole('heading', { name: /⏭️Skip Mood/ })
        screen.getByText('80.0% are full listens')
        screen.getByText('Skippped (20)')
        screen.getByText('Completed (80)')
        screen.getByText(/Patient/)
    })
})
