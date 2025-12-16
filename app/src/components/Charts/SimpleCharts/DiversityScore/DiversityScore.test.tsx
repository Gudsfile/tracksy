import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DiversityScore } from './DiversityScore'

describe('DiversityScore Component', () => {
    it('renders correctly with balanced data', () => {
        const data = {
            unique_artists: 100,
            total_streams: 300,
            avg_streams_per_artist: 30,
        }
        render(<DiversityScore data={data} />)
        screen.getByText('Balanced')
        screen.getByText('30.0 streams/artist (average)')
        screen.getByText(/100/)
        screen.getByText(/Artists/)
        screen.getByText(/300/)
        screen.getByText(/Streams/)
    })

    it('renders correctly with loyal data', () => {
        const data = {
            unique_artists: 50,
            total_streams: 500,
            avg_streams_per_artist: 100,
        }
        render(<DiversityScore data={data} />)
        screen.getByText('Loyal')
    })

    it('renders correctly with explorer data', () => {
        const data = {
            unique_artists: 200,
            total_streams: 400,
            avg_streams_per_artist: 2,
        }
        render(<DiversityScore data={data} />)
        screen.getByText('Explorer')
    })
})
