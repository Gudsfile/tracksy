import { describe, it, expect, vi, afterEach } from 'vitest'
import { isSafariIOS, isMobileBrowser } from './deviceDetection'

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

describe('isMobileBrowser', () => {
    it('returns true for iPhone Safari', () => {
        setUA(
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        )
        expect(isMobileBrowser()).toBe(true)
    })

    it('returns true for iPhone in PWA/standalone mode (no Safari token)', () => {
        setUA(
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21A331'
        )
        expect(isMobileBrowser()).toBe(true)
    })

    it('returns true for Chrome on iOS (CriOS)', () => {
        setUA(
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1'
        )
        expect(isMobileBrowser()).toBe(true)
    })

    it('returns true for Chrome on Android (Pixel)', () => {
        setUA(
            'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
        )
        expect(isMobileBrowser()).toBe(true)
    })

    it('returns true for Samsung Internet on Android', () => {
        setUA(
            'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36'
        )
        expect(isMobileBrowser()).toBe(true)
    })

    it('returns false for desktop Chrome', () => {
        setUA(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        )
        expect(isMobileBrowser()).toBe(false)
    })

    it('returns false for desktop Safari', () => {
        setUA(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
        )
        expect(isMobileBrowser()).toBe(false)
    })

    it('returns false for desktop Firefox', () => {
        setUA(
            'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0'
        )
        expect(isMobileBrowser()).toBe(false)
    })
})
