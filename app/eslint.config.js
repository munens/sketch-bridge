import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      eslintPluginPrettierRecommended,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react,
      'prefer-arrow-functions': preferArrowFunctions,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/prefer-stateless-function': 'error',
      "react/button-has-type": "error",
      "react/no-unused-prop-types": "error",
      "react/jsx-pascal-case": "error",
      "react/jsx-no-script-url": "error",
      "react/no-children-prop": "error",
      "react/no-danger": "error",
      "react/no-danger-with-children": "error",
      "react/no-unstable-nested-components": ["error", { "allowAsProps": true }],
      "react/jsx-fragments": "error",
      "react/destructuring-assignment": [
        "error",
        "always",
        { "destructureInSignature": "always" }
      ],
      "react/jsx-no-leaked-render": ["error", { "validStrategies": ["ternary"] }],
      "react/jsx-max-depth": ["error", { "max": 5 }],
      "react/function-component-definition": [
        "warn",
        { "namedComponents": "arrow-function" }
      ],
      "react/jsx-key": [
        "error",
        {
          "checkFragmentShorthand": true,
          "checkKeyMustBeforeSpread": true,
          "warnOnDuplicates": true
        }
      ],
      "react/jsx-no-useless-fragment": "warn",
      "react/jsx-curly-brace-presence": "warn",
      "react/no-typos": "warn",
      "react/display-name": "warn",
      "react/self-closing-comp": "warn",
      "react/jsx-sort-props": "warn",
      "react/react-in-jsx-scope": "off",
      "react/jsx-one-expression-per-line": "off",
      "react/prop-types": "off",
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          "selector": "default",
          "format": ["camelCase"],
          "leadingUnderscore": "allow"
        },
        {
          "selector": "variable",
          // Specify PascalCase for React components
          "format": ["PascalCase", "camelCase"],
          "leadingUnderscore": "allow"
        },
        {
          "selector": "parameter",
          "format": ["camelCase"],
          "leadingUnderscore": "allow"
        },
        {
          "selector": "property",
          "format": null,
          "leadingUnderscore": "allow"
        },
        {
          "selector": "typeLike",
          "format": ["PascalCase"]
        }
      ],
      "prefer-arrow-functions/prefer-arrow-functions": [
        "warn",
        {
          "classPropertiesAllowed": true,
          "disallowPrototype": true,
          "returnStyle": "unchanged"
        }
      ],
      "arrow-body-style": "warn",
      "prefer-arrow-callback": [
        "warn",
        {
          "allowNamedFunctions": true
        }
      ]
    },
  },
)
