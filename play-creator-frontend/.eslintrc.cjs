module.exports = {
  root: true,
  env: { browser: true, es2023: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-refresh/recommended',
    'prettier'
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    'react/react-in-jsx-scope': 'off'
  }
};
