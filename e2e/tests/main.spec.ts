// FIXME: download the dataset from hugging face and use it instead of the zip file https://github.com/Gudsfile/tracksy/issues/242

import { test, expect } from '@playwright/test'
import * as path from 'path'

test('has title and can upload dataset', async ({ page }) => {
    await page.goto(process.env.TEST_PATH || '/tracksy')

    await test.step('upload dataset', async () => {
        await expect(page).toHaveTitle(/Tracksy/)
        await expect(page.locator('h1').getByRole('link', { name: 'Tracksy' })).toBeVisible()

        const fileInput = page.locator('input[type="file"]')
        await fileInput.setInputFiles(path.join(__dirname, '../datasets/spotify/streamings_1000.zip'))
    })

    const simpleViewTab = page.getByRole('tab', { name: /✨ Simple/ })
    const labView = page.getByRole('tab', { name: /🔬 Lab/ })

    await test.step('tabs visible after upload', async () => {
        await expect(simpleViewTab).toBeVisible()
        await expect(simpleViewTab).toHaveAttribute('aria-selected', 'true')

        await expect(labView).toBeVisible()
        await expect(labView).not.toHaveAttribute('aria-selected', 'true')

        const chatView = page.getByRole('tab', { name: /💬 Chat/ })
        await expect(chatView).toBeVisible()
        await expect(chatView).not.toHaveAttribute('aria-selected', 'true')

        const queryView = page.getByRole('tab', { name: /⌨️ Query/ })
        await expect(queryView).toBeVisible()
        await expect(queryView).not.toHaveAttribute('aria-selected', 'true')
    })

    await test.step('filter by year 2025', async () => {
        const year2025Button = page
            .getByRole('navigation', { name: 'Filter by year' })
            .getByRole('button', { name: '2025', exact: true })
        await year2025Button.click()
        await expect(year2025Button).toHaveAttribute('aria-pressed', 'true')
    })

    await test.step('top tracks card', async () => {
        const topTracksCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /Top Tracks/ }),
        })
        await expect(topTracksCard).toBeVisible()

        const firstTopTrack = topTracksCard.getByRole('listitem').filter({ hasText: 'benchmark e-busi' })
        await expect.soft(firstTopTrack).toBeVisible()
        await expect.soft(firstTopTrack).toContainText('🥇')
        await expect.soft(firstTopTrack).toContainText('Teresa King')
        await expect.soft(firstTopTrack).toContainText('35')
    })

    await test.step('top artists card', async () => {
        const topArtistsCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /Top Artists/ }),
        })
        await expect(topArtistsCard).toBeVisible()

        const secondTopArtist = topArtistsCard.getByRole('listitem').filter({ hasText: 'Michelle Marshall' })
        await expect.soft(secondTopArtist).toBeVisible()
        await expect.soft(secondTopArtist).toContainText('🥈')
        await expect.soft(secondTopArtist).toContainText('2h')
        await expect.soft(secondTopArtist).toContainText('32')
    })

    await test.step('top albums card', async () => {
        const topAlbumsCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /Top Albums/ }),
        })
        await expect(topAlbumsCard).toBeVisible()

        const fifthTopAlbum = topAlbumsCard.getByRole('listitem').filter({ hasText: 'Compatible recipro' })
        await expect.soft(fifthTopAlbum).toBeVisible()
        await expect.soft(fifthTopAlbum).toContainText('5️⃣')
        await expect.soft(fifthTopAlbum).toContainText('Ryan Collins')
        await expect.soft(fifthTopAlbum).toContainText('18')
    })

    await test.step('listening activity section', async () => {
        await expect(page.getByRole('heading', { name: /Listening activity/ })).toBeVisible()
    })

    await test.step('focus mode card', async () => {
        const focusModeCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /Focus Mode/ }),
        })
        await expect(focusModeCard).toBeVisible()
        await expect.soft(focusModeCard.getByRole('listitem').filter({ hasText: 'Top 5' })).toContainText('39.6%')
        await expect.soft(focusModeCard.getByRole('listitem').filter({ hasText: 'Top 10' })).toContainText('64.3%')
        await expect.soft(focusModeCard.getByRole('listitem').filter({ hasText: 'Top 20' })).toContainText('87.1%')
    })

    await test.step('artist loyalty card', async () => {
        const loyaltyCard = page
            .locator('.group')
            .filter({ has: page.getByRole('heading', { name: /Artist Loyalty/ }) })
        await expect(loyaltyCard).toBeVisible()
        await expect.soft(loyaltyCard.getByText('Balanced Regular43 artists')).toBeVisible()
        await expect.soft(loyaltyCard.getByText('1 stream3%')).toBeVisible()
        await expect.soft(loyaltyCard.getByText('2-10 streams21%')).toBeVisible()
        await expect.soft(loyaltyCard.getByText('11-100 streams76%')).toBeVisible()
        await expect.soft(loyaltyCard.getByText('101-1000 streams0%')).toBeVisible()
        await expect.soft(loyaltyCard.getByText('1000+ streams0%')).toBeVisible()
    })

    await test.step('daily vibes card', async () => {
        const dailyVibesCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /Daily Vibes/ }),
        })
        await expect(dailyVibesCard).toBeVisible()
        await expect.soft(dailyVibesCard.getByText('Morning166 streams')).toBeVisible()
        await expect.soft(dailyVibesCard.getByRole('listitem').filter({ hasText: 'Morning' })).toContainText('49.8%')
        await expect.soft(dailyVibesCard.getByRole('listitem').filter({ hasText: 'Afternoon' })).toContainText('12.9%')
        await expect.soft(dailyVibesCard.getByRole('listitem').filter({ hasText: 'Evening' })).toContainText('25.8%')
        await expect.soft(dailyVibesCard.getByRole('listitem').filter({ hasText: 'Night' })).toContainText('11.4%')
    })

    await test.step('consistency meter card', async () => {
        const consistencyMeterCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /Consistency Meter/ }),
        })
        await expect(consistencyMeterCard).toBeVisible()
        await expect.soft(consistencyMeterCard.getByText('Regular', { exact: true })).toBeVisible()
        await expect.soft(consistencyMeterCard.getByText('203 / 365 days')).toBeVisible()
        await expect.soft(consistencyMeterCard.getByText('56%')).toBeVisible()
        await expect.soft(consistencyMeterCard.getByText('31d')).toBeVisible()
    })

    await test.step('soundtrack growth card', async () => {
        const soundtrackGrowthCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /Soundtrack Growth/ }),
        })
        await expect(soundtrackGrowthCard).toBeVisible()
        await expect
            .soft(soundtrackGrowthCard.getByRole('listitem').filter({ hasText: 'Total streams' }))
            .toContainText('960')
        await expect
            .soft(soundtrackGrowthCard.getByRole('listitem').filter({ hasText: 'This year' }))
            .toContainText('333')
    })

    await test.step('seasonal mood card', async () => {
        const seasonalMoodCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /Seasonal Mood/ }),
        })
        await expect(seasonalMoodCard).toBeVisible()
        await expect.soft(seasonalMoodCard.getByText('Winter99 streams')).toBeVisible()
        await expect.soft(seasonalMoodCard.getByRole('listitem').filter({ hasText: 'Winter' })).toContainText('29.7%')
        await expect.soft(seasonalMoodCard.getByRole('listitem').filter({ hasText: 'Spring' })).toContainText('28.2%')
        await expect.soft(seasonalMoodCard.getByRole('listitem').filter({ hasText: 'Summer' })).toContainText('12.6%')
        await expect.soft(seasonalMoodCard.getByRole('listitem').filter({ hasText: 'Fall' })).toContainText('29.4%')
    })

    await test.step('fresh vs familiar card', async () => {
        const freshVsFamiliarCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /Fresh vs Familiar/ }),
        })
        await expect(freshVsFamiliarCard).toBeVisible()
        await expect.soft(freshVsFamiliarCard.getByText('Comfort Listener', { exact: true })).toBeVisible()
        await expect.soft(freshVsFamiliarCard.getByText('6 new artists discovered this year!')).toBeVisible()
        await expect
            .soft(freshVsFamiliarCard.getByRole('listitem').filter({ hasText: 'Discoveries' }))
            .toContainText('3%')
        await expect
            .soft(freshVsFamiliarCard.getByRole('listitem').filter({ hasText: 'Favorites' }))
            .toContainText('97%')
    })

    await test.step('skip mood card', async () => {
        const skipMoodCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /Skip Mood/ }),
        })
        await expect(skipMoodCard).toBeVisible()
        await expect.soft(skipMoodCard.getByText('Patient', { exact: true })).toBeVisible()
        await expect.soft(skipMoodCard.getByText('83.2%')).toBeVisible()
        await expect.soft(skipMoodCard.getByRole('listitem').filter({ hasText: 'Skipped' })).toContainText('56')
        await expect.soft(skipMoodCard.getByRole('listitem').filter({ hasText: 'Completed' })).toContainText('277')
    })

    await test.step('replay style card', async () => {
        const replayStyleCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /Replay Style/ }),
        })
        await expect(replayStyleCard).toBeVisible()
        await expect.soft(replayStyleCard.getByText('Moderate', { exact: true })).toBeVisible()
        await expect.soft(replayStyleCard.getByText('12 repeated sequences')).toBeVisible()
        await expect
            .soft(replayStyleCard.getByRole('listitem').filter({ hasText: 'Repeat average' }))
            .toContainText('2.0 times')
    })

    await test.step('your sound machine card', async () => {
        const soundMachineCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /Your Sound Machine/ }),
        })
        await expect(soundMachineCard).toBeVisible()
        await expect.soft(soundMachineCard.getByText('Android OS72 streams')).toBeVisible()
        await expect
            .soft(soundMachineCard.getByRole('listitem').filter({ hasText: 'Android OS' }))
            .toContainText('21.6%')
        await expect.soft(soundMachineCard.getByRole('listitem').filter({ hasText: 'Windows' })).toContainText('20.7%')
        await expect.soft(soundMachineCard.getByRole('listitem').filter({ hasText: 'Others' })).toContainText('57.7%')
    })

    await test.step('your power day card', async () => {
        const powerDayCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /Your Power Day/ }),
        })
        await expect(powerDayCard).toBeVisible()
        await expect.soft(powerDayCard.getByText('Wednesday63 streams')).toBeVisible()
    })

    await test.step('listening sessions card', async () => {
        const listeningSessionsCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /Listening sessions/ }),
        })
        await expect(listeningSessionsCard).toBeVisible()
        await expect.soft(listeningSessionsCard.getByText('Express8 sessions')).toBeVisible()
    })

    await test.step('around the clock card', async () => {
        const aroundTheClockCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /Around the Clock/ }),
        })
        await expect(aroundTheClockCard).toBeVisible()
        await expect.soft(aroundTheClockCard.getByText('08h62 streams')).toBeVisible()
    })

    await test.step('on a roll card', async () => {
        const onARollCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /On a Roll/ }),
        })
        await expect(onARollCard).toBeVisible()
        await expect.soft(onARollCard.getByText('9days in a row')).toBeVisible()
    })

    await test.step('deep dive card', async () => {
        const deepDiveCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /Deep Dive/ }),
        })
        await expect(deepDiveCard).toBeVisible()
        await expect.soft(deepDiveCard.getByText('0h 20minin a day')).toBeVisible()
    })

    await test.step('eclectic day card', async () => {
        const eclecticDayCard = page.locator('.group').filter({
            has: page.getByRole('heading', { name: /Eclectic Day/ }),
        })
        await expect(eclecticDayCard).toBeVisible()
        await expect.soft(eclecticDayCard.getByText('4different artists')).toBeVisible()
    })

    await test.step('lab view', async () => {
        await labView.click()
        await expect(simpleViewTab).not.toHaveAttribute('aria-selected', 'true')
        await expect(labView).toHaveAttribute('aria-selected', 'true')

        await expect.soft(page.getByRole('heading', { name: /Stream Timeline/ })).toBeVisible()
        await expect.soft(page.getByRole('heading', { name: /Stream Variety/ })).toBeVisible()
        await expect.soft(page.getByRole('heading', { name: /Stream Discovery/ })).toBeVisible()
        await expect.soft(page.getByRole('heading', { name: /Top 10 Race/ })).toBeVisible()
        await expect.soft(page.getByRole('heading', { name: /Listening Streaks/ })).toBeVisible()
        await expect.soft(page.getByRole('heading', { name: /Listening Bingo/ })).toBeVisible()
    })
})
