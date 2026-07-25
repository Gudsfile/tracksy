import { describe, it, expect, vi, afterEach } from 'vitest'
import * as htmlToImage from 'html-to-image'
import {
    buildImageFilename,
    exportElementAsImage,
} from './exportElementAsImage'

describe('buildImageFilename', () => {
    it('builds a timestamped png filename', () => {
        expect(buildImageFilename()).toMatch(/^tracksy-\d{4}-\d{2}-\d{2}\.png$/)
    })

    it('respects a custom prefix', () => {
        expect(buildImageFilename('stats')).toMatch(/^stats-/)
    })
})

describe('exportElementAsImage', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('captures the element and triggers a download', async () => {
        const dataUrl = 'data:image/png;base64,abc'
        const toPngSpy = vi
            .spyOn(htmlToImage, 'toPng')
            .mockResolvedValue(dataUrl)
        const clickSpy = vi
            .spyOn(HTMLAnchorElement.prototype, 'click')
            .mockImplementation(() => {})

        const element = document.createElement('div')
        await exportElementAsImage(element, 'result.png')

        expect(toPngSpy).toHaveBeenCalledWith(
            element,
            expect.objectContaining({
                pixelRatio: 2,
                backgroundColor: '#f8fafc',
            })
        )
        expect(clickSpy).toHaveBeenCalledTimes(1)
    })

    it('propagates capture failures', async () => {
        vi.spyOn(htmlToImage, 'toPng').mockRejectedValue(new Error('boom'))
        const element = document.createElement('div')

        await expect(exportElementAsImage(element)).rejects.toThrow('boom')
    })
})
