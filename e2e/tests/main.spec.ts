// FIXME: download the dataset from hugging face and use it instead of the zip file https://github.com/Gudsfile/tracksy/issues/242

import { test, expect, chromium, Page } from '@playwright/test'
import * as path from 'path'

import { getTestPath } from '../helpers/getTestPath'
import { config } from '../ligthhouse.config'
import { runLighthouseStep } from '../helpers/runLighthouseStep'
import { isChromiumBrowser } from '../helpers/isChromiumBrowser'
import { computeJourneyScore } from '../helpers/computeJourneyScore'

const STEP_WEIGHTS = {
    landing: 0.25,
    afterUpload: 0.45, // heaviest: users rage here
    simpleViewRendered: 0.3,
}

test('Go to application, upload dataset and visualize simple view on Chromium with Lighthouse', async ({
    browserName,
}) => {
    if (isChromiumBrowser(browserName)) {
        const browser = await chromium.launch({
            args: [`--remote-debugging-port=${config.port}`],
            headless: true,
        })

        const context = await browser.newContext()
        const page = await context.newPage()

        const stepsScores = await tracksyUserJourney(page, runLighthouseStep)

        const globalScore = computeJourneyScore<keyof typeof STEP_WEIGHTS>(
            stepsScores,
            STEP_WEIGHTS
        )

        console.log({ globalScore })

        await browser.close()
    }
})

test('Go to application, upload dataset and visualize simple view', async ({
    page,
    browserName,
}) => {
    if (!isChromiumBrowser(browserName)) {
        await tracksyUserJourney(page)
    }
})

async function tracksyUserJourney(
    page: Page,
    execLighthouse?: typeof runLighthouseStep
) {
    let stepsScores: Record<
        keyof typeof STEP_WEIGHTS,
        Awaited<ReturnType<typeof runLighthouseStep>> | undefined
    > = {
        landing: undefined,
        afterUpload: undefined,
        simpleViewRendered: undefined,
    }

    await page.goto(getTestPath())

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Tracksy/)

    // 🧪 Measure initial load
    const landingPageScores = await execLighthouse?.('Landing page', page.url())
    stepsScores.landing = landingPageScores

    // Expect anchor under h1 with text "Tracksy" to be visible
    await expect(
        page.locator('h1').getByRole('link', { name: 'Tracksy' })
    ).toBeVisible()

    // Upload the zip file
    // Note: We use relative path from the test file to the dataset
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(
        path.join(__dirname, '../datasets/streamings_1000.zip')
    )

    // Simple view assertions
    const simpleViewTab = page.getByRole('tab', { name: /Simple View/ })
    await expect(simpleViewTab).toBeVisible()

    // 🧪 Measure post-upload state
    const afterUploadScores = await execLighthouse?.(
        'After dataset upload',
        page.url()
    )

    stepsScores.afterUpload = afterUploadScores

    // Assert it is active (selected)
    await expect(simpleViewTab).toHaveAttribute('aria-selected', 'true')

    /* Concentration Score Card */
    await expect(
        page.getByRole('heading', {
            name: /Concentration Score/,
        })
    ).toBeVisible()

    // 🧪 Measure visualization state
    const simpleViewRenderedScores = await execLighthouse?.(
        'Simple View rendered',
        page.url()
    )

    stepsScores.simpleViewRendered = simpleViewRenderedScores

    await expect(
        page.getByRole('listitem').filter({ hasText: 'Top 5' })
    ).toContainText('31.1%')

    await expect(
        page.getByRole('listitem').filter({ hasText: 'Top 10' })
    ).toContainText('44.6%')

    await expect(
        page.getByRole('listitem').filter({ hasText: 'Top 20' })
    ).toContainText('63.5%')

    /* Loyalty vs Discovery Card */
    const loyaltyCard = page.locator('.group').filter({
        has: page.getByRole('heading', { name: /Loyalty vs Discovery/ }),
    })
    await expect(loyaltyCard).toBeVisible()

    // Check Loyalty contents
    await expect(loyaltyCard.getByText('Explorer').first()).toBeVisible()
    await expect(
        loyaltyCard.getByRole('listitem').filter({ hasText: 'Artists' })
    ).toContainText('47')
    await expect(
        loyaltyCard.getByRole('listitem').filter({ hasText: 'Streams' })
    ).toContainText('74')

    /* Listening Rhythm Card */
    await expect(
        page.getByRole('heading', { name: /Listening Rhythm/ })
    ).toBeVisible()
    await expect(
        page.getByRole('listitem').filter({ hasText: 'Morning' })
    ).toContainText('23.0%')
    await expect(
        page.getByRole('listitem').filter({ hasText: 'Night' })
    ).toContainText('39.2%')

    /* Listening Regularity Card */
    await expect(
        page.getByRole('heading', { name: /Listening Regularity/ })
    ).toBeVisible()
    await expect(page.getByText('Occasional')).toBeVisible()
    await expect(page.getByText('66 / 354 days')).toBeVisible()
    await expect(page.getByText('19%')).toBeVisible()

    /* Evolution Card */
    await expect(page.getByRole('heading', { name: /Evolution/ })).toBeVisible()
    await expect(
        page.getByRole('listitem').filter({ hasText: 'Total streams' })
    ).toContainText('778')
    await expect(
        page.getByRole('listitem').filter({ hasText: 'This year' })
    ).toContainText('74')

    /* Seasonal patterns Card */
    await expect(
        page.getByRole('heading', { name: /Seasonal patterns/ })
    ).toBeVisible()
    await expect(page.getByText('Your favorite season: Fall')).toBeVisible()
    // We can also check the list item for Fall
    await expect(
        page.getByRole('listitem').filter({ hasText: 'Fall' })
    ).toContainText('33.8%')

    /* New vs Old Card */
    await expect(
        page.getByRole('heading', { name: /New vs Old/ })
    ).toBeVisible()
    await expect(
        page.getByText('5 new artists discovered this year!')
    ).toBeVisible()
    await expect(
        page.getByRole('listitem').filter({ hasText: 'Découvertes' })
    ).toContainText('14%')

    /* Listening Patience Card */
    await expect(
        page.getByRole('heading', { name: /Listening Patience/ })
    ).toBeVisible()
    await expect(page.getByText('100.0%')).toBeVisible()
    await expect(
        page.getByRole('listitem').filter({ hasText: 'Completed' })
    ).toContainText('74')

    /* Repeat Behavior Card */
    await expect(
        page.getByRole('heading', { name: /Repeat Behavior/ })
    ).toBeVisible()
    await expect(page.getByText('Variated')).toBeVisible()
    await expect(
        page.getByRole('listitem').filter({ hasText: 'Repeat average' })
    ).toContainText('2.0 times')

    /* Listening Devices Card */
    await expect(
        page.getByRole('heading', { name: /Listening Devices/ })
    ).toBeVisible()
    await expect(page.getByText('Main platform')).toBeVisible()
    await expect(
        page.getByRole('listitem').filter({ hasText: 'Windows' })
    ).toContainText('45.9%')

    /* Favorite Weekday Card */
    await expect(
        page.getByRole('heading', { name: /Favorite Weekday/ })
    ).toBeVisible()
    await expect(page.getByText('Monday').first()).toBeVisible()
    await expect(page.getByText('13 streams')).toBeVisible()

    return stepsScores
}
