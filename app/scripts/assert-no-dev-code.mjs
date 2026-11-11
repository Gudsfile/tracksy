/**
 * Fails the build if any development-only observability code reached the
 * production bundle.
 *
 * The tracing, eval, and dev-toolbar features are dev-only by design. That is
 * enforced structurally — the sole importer of `webllm-otel` sits behind a
 * dynamic import inside an `import.meta.env.DEV` branch, which Rollup drops — but
 * "structurally enforced" is a claim, and claims rot. One innocent-looking
 * top-level `import` in a shared module is enough to pull the whole graph back
 * in, and nothing else in the build would complain.
 *
 * So we assert it instead of trusting it. Run after `astro build`.
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

const DIST = fileURLToPath(new URL('../dist/', import.meta.url))

/**
 * Strings that must never appear in a production build, each paired with what
 * its presence would mean. Keep these distinctive: a marker that collides with
 * ordinary application text produces false alarms, and a check that cries wolf
 * gets deleted.
 */
const FORBIDDEN = [
    ['webllm-otel', 'the tracing library was bundled'],
    [
        'gen_ai.request.model',
        'GenAI semantic-convention attributes were bundled',
    ],
    // Covers the dev bus event prefix and every localStorage key derived from it,
    // including the eval result store.
    ['tracksy:dev:', 'the dev event bus or eval store was bundled'],
    ['EvalBridge', 'the eval runner island was bundled'],
    // A literal planted in llm/evals/cases.ts purely so this check has something
    // unmistakable to look for.
    ['TRACKSY_EVAL_CASE_MARKER', 'the eval case registry was bundled'],
]

/** Text-ish files worth scanning. Binary assets (wasm, fonts, images) are not. */
const SCANNED = /\.(js|mjs|cjs|css|html|json|map)$/

async function* walk(dir) {
    let entries
    try {
        entries = await readdir(dir, { withFileTypes: true })
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(
                `No build output at ${dir}. Run \`moon run app:build\` first.`
            )
        }
        throw error
    }
    for (const entry of entries) {
        const path = join(dir, entry.name)
        if (entry.isDirectory()) {
            yield* walk(path)
        } else if (SCANNED.test(entry.name)) {
            yield path
        }
    }
}

const violations = []

for await (const path of walk(DIST)) {
    const contents = await readFile(path, 'utf8')
    for (const [marker, meaning] of FORBIDDEN) {
        if (contents.includes(marker)) {
            violations.push({
                file: relative(DIST, path),
                marker,
                meaning,
            })
        }
    }
}

if (violations.length > 0) {
    console.error(
        `\n✗ Development-only code reached the production bundle (${violations.length} ${
            violations.length === 1 ? 'violation' : 'violations'
        }):\n`
    )
    for (const { file, marker, meaning } of violations) {
        console.error(`  dist/${file}`)
        console.error(`    found "${marker}" — ${meaning}\n`)
    }
    console.error(
        'Every tracing/eval module must be reachable only through a dynamic\n' +
            'import inside an `import.meta.env.DEV` branch. A top-level import\n' +
            'pulls it into the bundle even when the call below it is dead code.\n'
    )
    process.exit(1)
}

console.log(
    `✓ No dev-only code in the production bundle (${FORBIDDEN.length} markers checked).`
)
