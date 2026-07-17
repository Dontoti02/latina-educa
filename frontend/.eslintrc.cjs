/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    // ecmaVersion: '2020',
    ecmaVersion: 'latest',
    sourceType: 'module',
    // parser: '@typescript-eslint/parser'
  },
  env: {
    "vue/setup-compiler-macros": true,
  },
  rules: {
    'vue/multi-word-component-names': 0,
    'no-unused-vars': 'off',
    'eslint-disable-next-line' : 'off',
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always'
      }
    ],
    'vue/valid-v-slot': ["error", {
      "allowModifiers": true
    }]
  }
}