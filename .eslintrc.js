module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier", "import", "unused-imports"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "standard-with-typescript",
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".eslintrc.js", "ecosystem.config.js"],
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
        semi: true,
        singleQuote: false,
        trailingComma: "all",
      },
    ],
    quotes: ["error", "double"],
    "@typescript-eslint/quotes": "off",
    "sort-imports": [
      "error",
      {
        ignoreCase: false,
        ignoreDeclarationSort: true, // don"t want to sort import lines, use eslint-plugin-import instead
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
        allowSeparatedGroups: true,
      },
    ],
    "import/no-unresolved": "error",
    "import/order": [
      "error",
      {
        groups: [
          "builtin", // Built-in imports (come from NodeJS native) go first
          "external", // <- External imports
          "internal", // <- Absolute imports
          ["sibling", "parent"], // <- Relative imports, the sibling and parent types they can be mingled together
          "index", // <- index imports
          "unknown", // <- unknown
        ],
        "newlines-between": "always",
        alphabetize: {
          /* sort in ascending order. Options: ["ignore", "asc", "desc"] */
          order: "asc",
          /* ignore case. Options: [true, false] */
          caseInsensitive: true,
        },
      },
    ],
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    /** disable eslint rule see: https://typescript-eslint.io/rules/no-unused-vars/#how-to-use  */
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { varsIgnorePattern: "^", argsIgnorePattern: "^" }],
    "import/no-named-as-default": "off",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/semi": "off",
    "@typescript-eslint/no-extraneous-class": "off",
    "@typescript-eslint/comma-dangle": "off",
    "@typescript-eslint/space-before-function-paren": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/member-delimiter-style": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/require-await": "error",
    "@typescript-eslint/indent": "off",
    "import/no-named-as-default-member": "off",
  },
};
