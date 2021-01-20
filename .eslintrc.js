/**
 * @file eslintrc
 * @author kaivean
 */

// reference to https://github.com/ecomfe/eslint-config
module.exports = {
    extends: [
        '@ecomfe/eslint-config', // npm i -D eslint @babel/core @babel/eslint-parser @babel/eslint-plugin @ecomfe/eslint-config
        '@ecomfe/eslint-config/baidu/default',
        '@ecomfe/eslint-config/typescript'
    ],
    // parserOptions: {
    //     requireConfigFile: false,
    // },
    // env: {
    //     'jasmine': true,
    //     'es6': true,
    //     // 'browser': true,
    //     'node': true,
    // },
    globals: {
        akb: true,
    },
    rules: {
        // 'no-console': ['error', {allow: ['warn', 'error', 'log']}],
        // 'comma-dangle': ['error', {
        //     'arrays': 'never', // 对象和数组后面可以不加逗号
        //     'objects': 'never',
        // }],
        // 'import/no-commonjs': 'off',
        // 'import/unambiguous': 'off',
        // 'import/extensions': 'off',
        // 'import/no-unresolved': 'off',
    },
};
