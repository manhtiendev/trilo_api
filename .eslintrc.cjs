module.exports = {
  env: { es2020: true, node: true },
  extends: ['eslint:recommended'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
    allowImportExportEverywhere: true,
  },
  plugins: [],
  rules: {
    // Common
    'no-console': 1,
  },
};
