import { defineConfig } from "oxlint";
import solid from "eslint-plugin-solid/configs/typescript";

export default defineConfig({
  plugins: ["typescript", "oxc"],
  jsPlugins: ["eslint-plugin-simple-import-sort", "eslint-plugin-solid"],
  env: { browser: true, node: true },
  ignorePatterns: ["dist/**"],

  rules: {
    "no-unused-vars": "warn",
    "typescript/consistent-type-imports": [
      "warn",
      { prefer: "type-imports", fixStyle: "separate-type-imports" },
    ],

    "typescript/array-type": "warn",
    "typescript/consistent-type-definitions": "warn",
    "typescript/no-inferrable-types": "warn",
    "typescript/prefer-function-type": "warn",

    "simple-import-sort/imports": "warn",
    "simple-import-sort/exports": "warn",
  },

  overrides: [
    {
      files: ["**/*.{jsx,tsx}"],
      rules: {
        ...solid.rules,
        "solid/no-array-handlers": "error",
        "solid/no-unused-signal": "error",
        "solid/prefer-show": "error",
        "solid/removed-api": "error",
      },
    },
  ],
});
