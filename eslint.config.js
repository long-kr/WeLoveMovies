const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        "process": "readonly",
        "module": "readonly",
        "require": "readonly",
        "__dirname": "readonly",
        "console": "readonly",
      },
    },
    rules: {
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
      "indent": ["error", 2],
      "no-unused-vars": "warn",
      "no-console": "warn",
      "comma-spacing": ["error", { "before": false, "after": true }],
    },
  },
  {
    files: ["test/**/*.js"],
    languageOptions: {
      globals: {
        "describe": "readonly",
        "test": "readonly",
        "expect": "readonly",
        "beforeAll": "readonly",
        "beforeEach": "readonly",
        "afterAll": "readonly",
        "jest": "readonly",
      },
    },
  },
];