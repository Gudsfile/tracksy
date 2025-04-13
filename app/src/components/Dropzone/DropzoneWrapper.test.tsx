import { render } from '@testing-library/react'
import { it, vi } from 'vitest'

import { DropzoneWrapper } from './DropzoneWrapper'
import React from 'react'

it('should render', () => {
    render(<DropzoneWrapper setFiles={vi.fn()} />)
})
