const js = require("@eslint/js");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const prettier = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");
const simpleImportSort = require("eslint-plugin-simple-import-sort");

module.exports = [
  js.configs.recommended,
  {
    ignores: [
      "node_modules/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "*.config.js",
      "public/**",
    ],
  },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        // Web APIs
        fetch: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
        File: "readonly",
        FormData: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      prettier,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      ...prettierConfig.rules,
      // Import sorting
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // Side effects
            ["^\\u0000"],
            // React first
            ["^react", "^react-dom"],
            // External packages
            ["^@?\\w"],
            // Alias imports (@/)
            ["^@/"],
            // Relative imports
            ["^\\."],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      // Code quality rules
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-console": "off",
      "no-debugger": "warn",
      "no-alert": "warn",
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
          vars: "all",
          args: "after-used",
        },
      ],
      // React rules
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "prettier/prettier": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
