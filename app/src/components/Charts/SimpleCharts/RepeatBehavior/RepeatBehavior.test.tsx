import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RepeatBehavior } from './RepeatBehavior'
import { type RepeatResult } from './query'

describe('RepeatBehavior Component', () => {
    it('renders empty state when all values are zero', () => {
        render(
            <RepeatBehavior
                data={{
                    total_repeat_sequences: 0,
                    max_consecutive: 0,
                    most_repeated_track: '',
                    avg_repeat_length: 0,
                }}
                isLoading={false}
            />
        )
        screen.getByText('No data for this year')
    })

    it('renders correctly with data', async () => {
        const data: RepeatResult = {
            total_repeat_sequences: 15,
            max_consecutive: 5,
            most_repeated_track: 'track_name',
            avg_repeat_length: 3.5,
        }

        render(<RepeatBehavior data={data} />)

        screen.getByRole('heading', { name: /🔁Replay Energy/ })
        screen.getByText('"track_name"')
        screen.getByText('5 times in a row 🎸')
        screen.getByText(/15 repeated sequences/)
        screen.getByText('3.5 times')
    })

    it('renders empty state when data is undefined', () => {
        render(<RepeatBehavior data={undefined} isLoading={false} />)
        screen.getByText('No data for this year')
    })
})
