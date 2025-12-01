import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Regularity } from './Regularity'

describe('Regularity Component', () => {
    it('renders correctly with high regularity', () => {
        const data = {
            days_with_streams: 28,
            total_days: 30,
            longest_pause_days: 1,
        }
        render(<Regularity data={data} />)
        screen.getByText('Constant')
        screen.getByText('93%')
        screen.getByText('28')
        screen.getByText(/\/ 30 days/)
    })

    it('renders correctly with medium regularity', () => {
        const data = {
            days_with_streams: 15,
            total_days: 30,
            longest_pause_days: 3,
        }
        render(<Regularity data={data} />)
        screen.getByText('Regular')
    })

    it('renders correctly with low regularity', () => {
        const data = {
            days_with_streams: 5,
            total_days: 30,
            longest_pause_days: 10,
        }
        render(<Regularity data={data} />)
        screen.getByText('Occasional')
    })
})
