import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkipRate } from './SkipRate'

describe('SkipRate Component', () => {
    it('renders correctly with data', async () => {
        const data = { complete_listens: 80, skipped_listens: 20 }

        render(<SkipRate data={data} />)

        screen.getByText('⏭️ Listening Patience')
        screen.getByText('80.0%')
        screen.getByText('Skippped (20)')
        screen.getByText('Completed (80)')
        screen.getByText(/Patient/)
    })
})
