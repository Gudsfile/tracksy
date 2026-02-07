/** @type {import("prettier").Config} */

import base from '../base.prettier.mjs'

export default {
    ...base,
    plugins: ['prettier-plugin-astro'],
    overrides: [
        {
            files: '*.astro',
            options: {
                parser: 'astro',
            },
        },
    ],
}
