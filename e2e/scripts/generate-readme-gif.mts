/**
 * Generates the demo GIF shown in the project README.
 *
 * It drives the real application with Playwright (uploading the deterministic
 * e2e dataset and walking the main demo flow), records the session as a video,
 * then converts that video into an optimized GIF with ffmpeg.
 *
 * Requirements:
 *   - The application dev server must be reachable (see `URL` env var, defaults
 *     to http://localhost:4321). The `e2e:generate-readme-gif` moon task starts
 *     `app:dev` automatically.
 *   - The deterministic dataset must exist at
 *     `e2e/datasets/spotify/streamings_1000.zip` (produced by
 *     `synthetic-datasets:generate-e2e`).
 *   - `ffmpeg` must be installed and available on the PATH.
 *
 * Usage:
 *   moon run e2e:generate-readme-gif
 */

import { chromium } from '@playwright/test'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const e2eDir = path.resolve(scriptDir, '..')
const repoRoot = path.resolve(e2eDir, '..')

const baseUrl = process.env.URL || 'http://localhost:4321'
const appPath = process.env.TEST_PATH || '/tracksy'
const datasetZip = path.join(e2eDir, 'datasets/spotify/streamings_1000.zip')
const outputGif = path.join(repoRoot, '.github/img/tracksy_demo.gif')

const viewport = { width: 1280, height: 800 }
/** Frames per second and target width of the produced GIF. */
const gifFps = 10
const gifWidth = 640

async function sleep(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
    const url = `${baseUrl}${appPath}`
    const videoDir = mkdtempSync(path.join(tmpdir(), 'tracksy-demo-'))
    const browser = await chromium.launch()

    // Warm up the dev server first (cold Vite compilation of the DuckDB/arrow
    // island can be slow) so the recorded session loads instantly.
    console.log(`Warming up ${url}`)
    const warmup = await browser.newContext({ viewport })
    const warmupPage = await warmup.newPage()
    await gotoWhenReady(warmupPage, url)
    await warmupPage.locator('input[type="file"]').waitFor({ state: 'attached', timeout: 120_000 })
    await warmup.close()

    console.log(`Recording demo against ${url}`)
    const context = await browser.newContext({
        viewport,
        colorScheme: 'dark',
        recordVideo: { dir: videoDir, size: viewport },
    })
    // Persist the dark theme preference before the app renders so the very first
    // painted frame is already dark (the app reads `tracksy-theme` from
    // localStorage to set the `dark` class ahead of hydration).
    await context.addInitScript(() => {
        try {
            localStorage.setItem('tracksy-theme', 'dark')
        } catch {
            // Ignore environments where localStorage is unavailable.
        }
    })
    const page = await context.newPage()

    await page.goto(url)
    await page.locator('h1').getByRole('link', { name: 'Tracksy' }).waitFor()
    await page.locator('input[type="file"]').waitFor({ state: 'attached', timeout: 60_000 })
    await sleep(1200)

    // Upload the deterministic demo dataset.
    await page.locator('input[type="file"]').setInputFiles(datasetZip)

    // Wait for the Simple view to render once processing completes.
    const simpleTab = page.getByRole('tab', { name: /✨ Simple/ })
    const labTab = page.getByRole('tab', { name: /🔬 Lab/ })
    await simpleTab.waitFor({ timeout: 60_000 })
    await page.getByRole('heading', { name: /Top Tracks/ }).waitFor({ timeout: 60_000 })
    await sleep(1500)

    // Highlight the year filter.
    const year2025 = page
        .getByRole('navigation', { name: 'Filter by year' })
        .getByRole('button', { name: '2025', exact: true })
    if (await year2025.isVisible()) {
        await year2025.click()
        await sleep(1200)
    }

    // Slowly scroll through the Simple view cards.
    await smoothScrollTo(page, 0.85)
    await sleep(1200)

    // Switch to the Lab view and let its charts render.
    await smoothScrollTo(page, 0)
    await labTab.click()
    await page.getByRole('heading', { name: /Stream Timeline/ }).waitFor({ timeout: 60_000 })
    await sleep(1200)

    const year2025Lab = page
        .getByRole('navigation', { name: 'Filter by year' })
        .getByRole('button', { name: '2025', exact: true })
    if (await year2025Lab.isVisible()) {
        await year2025Lab.click()
        await sleep(1200)
    }
    await smoothScrollTo(page, 0.5)
    await sleep(1000)

    await context.close()
    await browser.close()

    const video = page.video()
    if (!video) {
        throw new Error('Playwright did not record a video')
    }
    const webmPath = await video.path()
    console.log(`Recorded video: ${webmPath}`)

    mkdirSync(path.dirname(outputGif), { recursive: true })
    convertToGif(webmPath, outputGif)
    optimizeGif(outputGif)
    rmSync(videoDir, { recursive: true, force: true })

    console.log(`Generated GIF: ${outputGif}`)
}

/** Navigates once the dev server accepts connections, retrying for up to ~90s. */
async function gotoWhenReady(page: import('@playwright/test').Page, url: string) {
    const deadline = Date.now() + 90_000
    for (;;) {
        try {
            await page.goto(url)
            return
        } catch (error) {
            if (Date.now() > deadline) {
                throw error
            }
            await sleep(1000)
        }
    }
}

/** Scrolls the page to a fraction (0..1) of its scrollable height, in steps. */
async function smoothScrollTo(page: import('@playwright/test').Page, fraction: number) {
    await page.evaluate(async (target) => {
        const maxScroll = document.body.scrollHeight - window.innerHeight
        const to = Math.max(0, maxScroll * target)
        const from = window.scrollY
        const steps = 30
        for (let i = 1; i <= steps; i++) {
            window.scrollTo(0, from + ((to - from) * i) / steps)
            await new Promise((resolve) => setTimeout(resolve, 40))
        }
    }, fraction)
}

/** Converts the recorded webm into a GIF using ffmpeg with a diff palette. */
function convertToGif(input: string, output: string) {
    const filter =
        `fps=${gifFps},scale=${gifWidth}:-1:flags=lanczos,` +
        `split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];` +
        `[s1][p]paletteuse=dither=bayer:bayer_scale=5`
    const result = spawnSync('ffmpeg', ['-y', '-i', input, '-vf', filter, '-loop', '0', output], {
        stdio: 'inherit',
    })
    if (result.error) {
        throw new Error(`Failed to run ffmpeg (is it installed?): ${result.error.message}`)
    }
    if (result.status !== 0) {
        throw new Error(`ffmpeg exited with code ${result.status}`)
    }
}

/** Further shrinks the GIF with gifsicle when it is available (optional). */
function optimizeGif(output: string) {
    const result = spawnSync('gifsicle', ['--batch', '-O3', '--lossy=90', output], { stdio: 'inherit' })
    if (result.error) {
        console.warn('gifsicle not found, skipping extra optimization (install it for a smaller GIF)')
        return
    }
    if (result.status !== 0) {
        console.warn(`gifsicle exited with code ${result.status}, keeping the unoptimized GIF`)
    }
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
