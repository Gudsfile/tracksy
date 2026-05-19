import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as streamProvider from '../../streamProvider'
import * as isZipArchiveModule from '../../utils/isZipArchive'
import * as openArchiveModule from '../../utils/openArchive'
import { UPLOAD_ERROR } from '../../utils/uploadErrorMessages'
import { useFileUpload } from './useFileUpload'

beforeEach(() => {
    vi.restoreAllMocks()
})

describe('useFileUpload', () => {
    it('calls onFail with the error when a file has an unsupported content type', async () => {
        vi.spyOn(streamProvider, 'isAllowedFileContentType').mockReturnValue(
            false
        )
        vi.spyOn(isZipArchiveModule, 'isZipArchive').mockReturnValue(false)

        const onFail = vi.fn()
        const { result } = renderHook(() =>
            useFileUpload({ onSuccess: vi.fn(), onFail })
        )

        const file = new File(['{}'], 'random.json', {
            type: 'application/json',
        })
        const fileList = Object.assign([file], { item: () => file })
        await result.current.uploadFiles(fileList as unknown as FileList)

        expect(onFail).toHaveBeenCalledOnce()
        const error = onFail.mock.calls[0][0]
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe(
            UPLOAD_ERROR.UNSUPPORTED_CONTENT_TYPE
        )
    })

    it('calls onSuccess and does not call onFail when files are valid', async () => {
        vi.spyOn(streamProvider, 'isAllowedFileContentType').mockReturnValue(
            true
        )
        vi.spyOn(isZipArchiveModule, 'isZipArchive').mockReturnValue(false)

        const onSuccess = vi.fn()
        const onFail = vi.fn()
        const { result } = renderHook(() =>
            useFileUpload({ onSuccess, onFail })
        )

        const file = new File(['{}'], 'valid.json', {
            type: 'application/json',
        })
        const fileList = Object.assign([file], { item: () => file, length: 1 })
        await result.current.uploadFiles(fileList as unknown as FileList)

        expect(onSuccess).toHaveBeenCalledOnce()
        expect(onFail).not.toHaveBeenCalled()
    })

    it('calls onFail with the thrown value when a non-Error is thrown', async () => {
        vi.spyOn(streamProvider, 'isAllowedFileContentType').mockImplementation(
            () => {
                throw 'unexpected string error'
            }
        )
        vi.spyOn(isZipArchiveModule, 'isZipArchive').mockReturnValue(false)

        const onFail = vi.fn()
        const { result } = renderHook(() =>
            useFileUpload({ onSuccess: vi.fn(), onFail })
        )

        const file = new File(['{}'], 'test.json', { type: 'application/json' })
        const fileList = Object.assign([file], { item: () => file })
        await result.current.uploadFiles(fileList as unknown as FileList)

        expect(onFail).toHaveBeenCalledOnce()
        expect(onFail.mock.calls[0][0]).toBe('unexpected string error')
    })

    it('calls onFail with the error when a ZIP archive contains no files', async () => {
        vi.spyOn(streamProvider, 'isAllowedFileContentType').mockReturnValue(
            true
        )
        vi.spyOn(isZipArchiveModule, 'isZipArchive').mockReturnValue(true)
        vi.spyOn(openArchiveModule, 'openArchive').mockResolvedValue({
            extractFiles: async () => ({}),
        } as unknown as Awaited<
            ReturnType<typeof openArchiveModule.openArchive>
        >)

        const onFail = vi.fn()
        const { result } = renderHook(() =>
            useFileUpload({ onSuccess: vi.fn(), onFail })
        )

        const file = new File([''], 'empty.zip', { type: 'application/zip' })
        const fileList = Object.assign([file], {
            item: (i: number) => [file][i],
            length: 1,
        })
        await result.current.uploadFiles(fileList as unknown as FileList)

        expect(onFail).toHaveBeenCalledOnce()
        const error = onFail.mock.calls[0][0]
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe(UPLOAD_ERROR.NO_FILES_IN_ARCHIVE)
    })
})
