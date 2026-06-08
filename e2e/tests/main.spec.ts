// FIXME: download the dataset from hugging face and use it instead of the zip file https://github.com/Gudsfile/tracksy/issues/242

import { test, expect } from '@playwright/test'
import * as path from 'path'

test('has title and can upload dataset', async ({ page }) => {
    await page.goto(process.env.TEST_PATH || '/tracksy')

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Tracksy/)

    // Expect anchor under h1 with text "Tracksy" to be visible
    await expect(page.locator('h1').getByRole('link', { name: 'Tracksy' })).toBeVisible()

    // Upload the zip file
    // Note: We use relative path from the test file to the dataset
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(path.join(__dirname, '../datasets/spotify/streamings_1000.zip'))

    // Simple view assertions
    const simpleViewTab = page.getByRole('tab', { name: /✨ Simple/ })
    await expect(simpleViewTab).toBeVisible()

    // Assert it is active (selected)
    await expect(simpleViewTab).toHaveAttribute('aria-selected', 'true')

    // Assert other tabs
    const labView = page.getByRole('tab', { name: /🔬 Lab/ })
    await expect(labView).toBeVisible()
    await expect(labView).not.toHaveAttribute('aria-selected', 'true')

    const chatView = page.getByRole('tab', { name: /💬 Chat/ })
    await expect(chatView).toBeVisible()
    await expect(chatView).not.toHaveAttribute('aria-selected', 'true')

    const queryView = page.getByRole('tab', { name: /⌨️ Query/ })
    await expect(queryView).toBeVisible()
    await expect(queryView).not.toHaveAttribute('aria-selected', 'true')

    // Select 2025 in the year sidebar
    const year2025Button = page
        .getByRole('navigation', { name: 'Filter by year' })
        .getByRole('button', { name: '2025', exact: true })
    await year2025Button.click()
    await expect(year2025Button).toHaveAttribute('aria-pressed', 'true')

    /* Top Tracks Card */
    const topTracksCard = page.locator('.group').filter({
        has: page.getByRole('heading', { name: /Top Tracks/ }),
    })
    await expect(topTracksCard).toBeVisible()

    const firstTopTrack = topTracksCard.getByRole('listitem').filter({ hasText: 'benchmark e-busi' })
    await expect(firstTopTrack).toBeVisible()
    await expect(firstTopTrack).toContainText('🥇')
    await expect(firstTopTrack).toContainText('Teresa King')
    await expect(firstTopTrack).toContainText('35')

    /* Top Artists Card */
    const topArtistsCard = page.locator('.group').filter({
        has: page.getByRole('heading', { name: /Top Artists/ }),
    })
    await expect(topArtistsCard).toBeVisible()

    const secondTopArtist = topArtistsCard.getByRole('listitem').filter({ hasText: 'Michelle Marshall' })
    await expect(secondTopArtist).toBeVisible()
    await expect(secondTopArtist).toContainText('🥈')
    await expect(secondTopArtist).toContainText('2h')
    await expect(secondTopArtist).toContainText('32')

    /* Top Albums Card */
    const topAlbumsCard = page.locator('.group').filter({
        has: page.getByRole('heading', { name: /Top Albums/ }),
    })
    await expect(topAlbumsCard).toBeVisible()

    const fifthTopAlbum = topAlbumsCard.getByRole('listitem').filter({ hasText: 'Compatible recipro' })
    await expect(fifthTopAlbum).toBeVisible()
    await expect(fifthTopAlbum).toContainText('5️⃣')
    await expect(fifthTopAlbum).toContainText('Ryan Collins')
    await expect(fifthTopAlbum).toContainText('18')

    /* Listening activity */
    await expect(page.getByRole('heading', { name: /Listening activity/ })).toBeVisible()

    /* Focus Mode Card */
    await expect(page.getByRole('heading', { name: /Focus Mode/ })).toBeVisible()
    await expect(page.getByRole('listitem').filter({ hasText: 'Top 5' })).toContainText('39.6%')
    await expect(page.getByRole('listitem').filter({ hasText: 'Top 10' })).toContainText('64.3%')
    await expect(page.getByRole('listitem').filter({ hasText: 'Top 20' })).toContainText('87.1%')

    /* Artist Loyalty Card */
    const loyaltyCard = page.locator('.group').filter({ has: page.getByRole('heading', { name: /Artist Loyalty/ }) })
    await expect(loyaltyCard).toBeVisible()
    await expect(loyaltyCard.getByText('Balanced Regular43 artists')).toBeVisible()
    await expect(loyaltyCard.getByText('1 stream3%')).toBeVisible()
    await expect(loyaltyCard.getByText('2-10 streams21%')).toBeVisible()
    await expect(loyaltyCard.getByText('11-100 streams76%')).toBeVisible()
    await expect(loyaltyCard.getByText('101-1000 streams0%')).toBeVisible()
    await expect(loyaltyCard.getByText('1000+ streams0%')).toBeVisible()

    /* Daily Vibes Card */
    await expect(page.getByRole('heading', { name: /Daily Vibes/ })).toBeVisible()
    await expect(page.getByText('Morning166 streams')).toBeVisible()
    await expect(page.getByRole('listitem').filter({ hasText: 'Morning' })).toContainText('49.8%')
    await expect(page.getByRole('listitem').filter({ hasText: 'Afternoon' })).toContainText('12.9%')
    await expect(page.getByRole('listitem').filter({ hasText: 'Evening' })).toContainText('25.8%')
    await expect(page.getByRole('listitem').filter({ hasText: 'Night' })).toContainText('11.4%')

    /* Consistency Meter Card */
    await expect(page.getByRole('heading', { name: /Consistency Meter/ })).toBeVisible()
    await expect(page.getByText('Regular', { exact: true })).toBeVisible()
    await expect(page.getByText('203 / 365 days')).toBeVisible()
    await expect(page.getByText('56%')).toBeVisible()
    await expect(page.getByText('31d')).toBeVisible()

    /* Soundtrack Growth */
    await expect(page.getByRole('heading', { name: /Soundtrack Growth/ })).toBeVisible()
    await expect(page.getByRole('listitem').filter({ hasText: 'Total streams' })).toContainText('960')
    await expect(page.getByRole('listitem').filter({ hasText: 'This year' })).toContainText('333')

    /* Seasonal Mood Card */
    await expect(page.getByRole('heading', { name: /Seasonal Mood/ })).toBeVisible()
    await expect(page.getByText('Winter99 streams')).toBeVisible()
    await expect(page.getByRole('listitem').filter({ hasText: 'Winter' })).toContainText('29.7%')
    await expect(page.getByRole('listitem').filter({ hasText: 'Spring' })).toContainText('28.2%')
    await expect(page.getByRole('listitem').filter({ hasText: 'Summer' })).toContainText('12.6%')
    await expect(page.getByRole('listitem').filter({ hasText: 'Fall' })).toContainText('29.4%')

    /* Fresh vs Familiar Card */
    await expect(page.getByRole('heading', { name: /Fresh vs Familiar/ })).toBeVisible()
    await expect(page.getByText('Comfort Listener', { exact: true })).toBeVisible()
    await expect(page.getByText('6 new artists discovered this year!')).toBeVisible()
    await expect(page.getByRole('listitem').filter({ hasText: 'Discoveries' })).toContainText('3%')
    await expect(page.getByRole('listitem').filter({ hasText: 'Favorites' })).toContainText('97%')

    /* Skip Mood Card */
    await expect(page.getByRole('heading', { name: /Skip Mood/ })).toBeVisible()
    await expect(page.getByText('Patient', { exact: true })).toBeVisible()
    await expect(page.getByText('83.2%')).toBeVisible()
    await expect(page.getByRole('listitem').filter({ hasText: 'Skippped' })).toContainText('56')
    await expect(page.getByRole('listitem').filter({ hasText: 'Completed' })).toContainText('277')

    /* Replay Energy Card */
    await expect(page.getByRole('heading', { name: /Replay Style/ })).toBeVisible()
    await expect(page.getByText('Moderate', { exact: true })).toBeVisible()
    await expect(page.getByText('12 repeated sequences')).toBeVisible()
    await expect(page.getByRole('listitem').filter({ hasText: 'Repeat average' })).toContainText('2.0 times')

    /* Your Sound Machine Card */
    await expect(page.getByRole('heading', { name: /Your Sound Machine/ })).toBeVisible()
    await expect(page.getByText('Android OS72 streams')).toBeVisible()
    await expect(page.getByRole('listitem').filter({ hasText: 'Android OS' })).toContainText('21.6%')
    await expect(page.getByRole('listitem').filter({ hasText: 'Windows' })).toContainText('20.7%')
    await expect(page.getByRole('listitem').filter({ hasText: 'Others' })).toContainText('57.7%')

    /* Your Power Day Card */
    await expect(page.getByRole('heading', { name: /Your Power Day/ })).toBeVisible()
    await expect(page.getByText('Wednesday63 streams')).toBeVisible()

    /* Listening sessions */
    await expect(page.getByRole('heading', { name: /Listening sessions/ })).toBeVisible()
    await expect(page.getByText('Express8 sessions')).toBeVisible()

    /* Around the Clock */
    await expect(page.getByRole('heading', { name: /Around the Clock/ })).toBeVisible()
    await expect(page.getByText('08h62 streams')).toBeVisible()

    /* On a Roll */
    await expect(page.getByRole('heading', { name: /On a Roll/ })).toBeVisible()
    await expect(page.getByText('9days in a row')).toBeVisible()

    /* Deep Dive */
    await expect(page.getByRole('heading', { name: /Deep Dive/ })).toBeVisible()
    await expect(page.getByText('0h 20minin a day')).toBeVisible()

    /* Eclectic Day */
    await expect(page.getByRole('heading', { name: /Eclectic Day/ })).toBeVisible()
    await expect(page.getByText('4different artists')).toBeVisible()
})
