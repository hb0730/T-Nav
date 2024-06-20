import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  typescript: true,
  vue: true,
  rules: {
    'no-undef': 'off',
    // 允许console
    'no-console': 'off',
    // 允许process
    'node/prefer-global/process': 'off',
  },
})
