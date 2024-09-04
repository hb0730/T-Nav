import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'node_modules',
    'dist',
    '.github',
  ],
  formatters: true,
  typescript: true,
  vue: true,
  rules: {
    'no-undef': 'off',
    // 允许console
    'no-console': 'off',
    // 允许process
    'node/prefer-global/process': 'off',
    // 允许函数定义内部
    'unicorn/consistent-function-scoping': 'warn',
  },
})
