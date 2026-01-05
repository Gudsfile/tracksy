import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RepeatBehavior } from './RepeatBehavior'
import { type RepeatResult } from './query'

describe('RepeatBehavior Component', () => {
    it('renders correctly with data', async () => {
        const data: RepeatResult = {
            total_repeat_sequences: 15,
            max_consecutive: 5,
            most_repeated_track: 'track_name',
            avg_repeat_length: 3.5,
        }

        render(<RepeatBehavior data={data} />)

        screen.getByText('🔁 Repeat Behavior')
        screen.getByText('"track_name"')
        screen.getByText('5 times in a row 🎸')
        screen.getByText('15')
        screen.getByText('3.5 times')
    })

    it('renders nothing when no data', async () => {
        render(
            <RepeatBehavior
                data={{
                    total_repeat_sequences: 0,
                    max_consecutive: null,
                    most_repeated_track: null,
                    avg_repeat_length: null,
                }}
            />
        )
        expect(screen.queryByText('🔁 Repeat Behavior')).toBeNull()
    })
})
