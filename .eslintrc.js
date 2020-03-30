module.exports = {
    env: {
        es6: true,
        browser: true,
    },
    extends: ['airbnb-base', 'prettier'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2018,
    },
    rules: {
        'linebreak-style': ['error', 'windows'],
        'no-console': 'off',
        'no-underscore-dangle': 'off',
        'no-tabs': ['error', { allowIndentationTabs: true }],
        'valid-jsdoc': 'error',
        'class-methods-use-this': 'off',
        'no-param-reassign': ['error', { props: false }],
        'no-unused-vars': 'warn',
        'max-len': [
            'error',
            {
                comments: 300,
                ignoreStrings: true,
                ignoreUrls: true,
                code: 100,
            },
        ],
    },
};
