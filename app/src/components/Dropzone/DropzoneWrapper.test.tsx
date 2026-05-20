import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as useFileUploadModule from './useFileUpload'
import { DropzoneWrapper } from './DropzoneWrapper'

beforeEach(() => {
    vi.restoreAllMocks()
})

it('should render', () => {
    render(<DropzoneWrapper handleValidatedFiles={vi.fn()} />)
})

describe('DropzoneWrapper', () => {
    it('renders supported provider names in the message', () => {
        const { container } = render(
            <DropzoneWrapper handleValidatedFiles={vi.fn()} />
        )
        expect(container.textContent).toContain('Spotify')
        expect(container.textContent).toContain('Deezer')
    })

    it('forwards onFail prop to useFileUpload', () => {
        const useFileUploadSpy = vi
            .spyOn(useFileUploadModule, 'useFileUpload')
            .mockReturnValue({ uploadFiles: vi.fn() })

        const onFail = vi.fn()
        render(
            <DropzoneWrapper handleValidatedFiles={vi.fn()} onFail={onFail} />
        )

        expect(useFileUploadSpy).toHaveBeenCalledWith(
            expect.objectContaining({ onFail })
        )
    })

    it('uses a no-op as default onFail when prop is omitted', () => {
        const useFileUploadSpy = vi
            .spyOn(useFileUploadModule, 'useFileUpload')
            .mockReturnValue({ uploadFiles: vi.fn() })

        render(<DropzoneWrapper handleValidatedFiles={vi.fn()} />)

        expect(useFileUploadSpy).toHaveBeenCalledWith(
            expect.objectContaining({ onFail: expect.any(Function) })
        )
    })
})
