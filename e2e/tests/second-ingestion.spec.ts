import { test, expect } from '@playwright/test'
import * as path from 'path'

// Regression test for https://github.com/Gudsfile/tracksy/issues/577: importing
// a second dataset in the same session used to throw a DuckDB Catalog Error
// ("Existing object music_streams is of type Table, trying to drop type View")
// because precompute.ts tried to DROP VIEW an object that was already a TABLE.
test('can ingest a second dataset after a first successful import', async ({ page }) => {
    // General hygiene, not the regression detector: the original bug is a
    // caught DuckDB error rendered through the `role="alert"` banner (see
    // TracksyWrapper.tsx), so it never surfaces here as an uncaught pageerror.
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    await page.goto(process.env.TEST_PATH || '/tracksy')

    const fileInput = page.locator('input[type="file"]')
    const simpleViewTab = page.getByRole('tab', { name: /✨ Simple/ })

    await test.step('first import succeeds', async () => {
        await fileInput.setInputFiles(path.join(__dirname, '../datasets/spotify/streamings_1000.zip'))
        await expect(simpleViewTab).toBeVisible()
    })

    await test.step('second import succeeds without an upload error', async () => {
        await fileInput.setInputFiles(
            path.join(__dirname, '../datasets/spotify/Streaming_History_Audio_2006_1000.json')
        )

        await expect(simpleViewTab).toBeVisible()
        // This is the assertion that actually catches the regression: the
        // DuckDB Catalog Error from #577 surfaces as an `UploadError` alert.
        await expect(page.getByRole('alert')).toHaveCount(0)
        await expect(page.getByRole('heading', { name: /Top Tracks/ })).toBeVisible()
    })

    expect(pageErrors).toEqual([])
})
