import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import * as useDBQueryModule from '../../../../hooks/useDBQuery'
import { SessionAnalysis } from './index'

describe('SessionAnalysis container', () => {
    it('renders nothing when data is undefined and not loading', () => {
        vi.spyOn(useDBQueryModule, 'useDBQueryFirst').mockReturnValue({
            data: undefined,
            isLoading: false,
            error: undefined,
        })
        const { container } = render(<SessionAnalysis year={2025} />)
        expect(container.firstChild).toBeNull()
    })
})
