module.exports = {
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  semi: false,
  trailingComma: 'none',
  overrides: [
    {
      files: '.prettierrc',
      options: { parser: 'babylon' }
    }
  ]
}
