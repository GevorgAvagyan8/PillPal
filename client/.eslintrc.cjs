module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  plugins: ["@typescript-eslint", "react-hooks", "react-refresh"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:react-hooks/recommended"],
  rules: {
    "react-refresh/only-export-components": "warn",
  },
  env: {
    browser: true,
    es2022: true,
  },
  ignorePatterns: ["dist", "node_modules"],
};
