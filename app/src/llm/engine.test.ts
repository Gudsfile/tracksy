import { describe, it, expect, vi, afterEach } from 'vitest'
import { isSafariIOS, selectModelId, MODEL_ID, MODEL_ID_IOS } from './engine'

const setUA = (ua: string) =>
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(ua)

afterEach(() => vi.restoreAllMocks())

describe('isSafariIOS', () => {
    it('returns true for iPhone Safari', () => {
        setUA(
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        )
        expect(isSafariIOS()).toBe(true)
    })

    it('returns true for iPad Safari', () => {
        setUA(
            'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        )
        expect(isSafariIOS()).toBe(true)
    })

    it('returns true for iPod Safari', () => {
        setUA(
            'Mozilla/5.0 (iPod touch; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        )
        expect(isSafariIOS()).toBe(true)
    })

    it('returns false for Chrome on iOS (CriOS)', () => {
        setUA(
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1'
        )
        expect(isSafariIOS()).toBe(false)
    })

    it('returns false for Firefox on iOS (FxiOS)', () => {
        setUA(
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0 Mobile/15E148 Safari/604.1'
        )
        expect(isSafariIOS()).toBe(false)
    })

    it('returns false for desktop Safari', () => {
        setUA(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
        )
        expect(isSafariIOS()).toBe(false)
    })

    it('returns false for Chrome desktop', () => {
        setUA(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        )
        expect(isSafariIOS()).toBe(false)
    })
})

describe('selectModelId', () => {
    it('returns IOS model on Safari iOS', () => {
        setUA(
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        )
        expect(selectModelId()).toBe(MODEL_ID_IOS)
    })

    it('returns full model on Chrome desktop', () => {
        setUA(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        )
        expect(selectModelId()).toBe(MODEL_ID)
    })
})
