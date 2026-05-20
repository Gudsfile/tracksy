import { describe, it, expect, vi, afterEach } from 'vitest'
import { selectModelId, MODEL_ID, MODEL_ID_IOS } from './engine'

const setUA = (ua: string) =>
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(ua)

afterEach(() => vi.restoreAllMocks())

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
