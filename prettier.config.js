//  @ts-check

/** @type {import('prettier').Config} */
const config = {
    semi: true,
    tabWidth: 4,
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 120,
    plugins: ['prettier-plugin-tailwindcss', 'prettier-plugin-classnames', "prettier-plugin-merge"],
};

export default config;
