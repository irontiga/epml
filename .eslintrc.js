module.exports = {
    extends: 'standard',
    rules: {
        indent: ['error', 4]
    },
    env : {
        es6: true,
        browser: true,
        worker: true
    },
    overrides: [
        {
            files: [
                '**/*.test.js',
                '__tests__/*'
            ],
            env: {
                jest: true // now **/*.test.js files' env has both es6 *and* jest
            },
            plugins: ['jest']
        }
    ]
}