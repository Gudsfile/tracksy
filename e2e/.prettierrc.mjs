/** @type {import("prettier").Config} */

export default {
    printWidth: 120,
    trailingComma: 'es5',
    tabWidth: 4,
    semi: false,
    singleQuote: true,

    overrides: [
        {
            files: '*.astro',
            options: {
                parser: 'astro',
            },
        },
    ],
}
