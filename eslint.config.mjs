// @ts-check
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import * as importPlugin from "eslint-plugin-import-x";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import-x/resolver": {
        typescript: {},
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              from: "./src/Application/**/*",
              target: "./src/Domain/**/!(*.spec.ts|*.test.ts)",
              message:
                "Domain層でApplication層をimportしてはいけません。ドメインロジックはアプリケーションの詳細から独立している必要があります。",
            },
            {
              from: "./src/Presentation/**/*",
              target: "./src/Domain/**/!(*.spec.ts|*.test.ts)",
              message:
                "Domain層でPresentation層をimportしてはいけません。ドメインロジックはUI実装の詳細から独立している必要があります。",
            },
            {
              from: "./src/Infrastructure/**/*!(test).ts",
              target: "./src/Domain/**/!(*.spec.ts|*.test.ts)",
              message:
                "Domain層でInfrastructure層をimportしてはいけません。ドメインロジックはデータベースやフレームワークの技術的詳細から独立している必要があります。",
            },
            {
              from: "./src/Presentation/**/*",
              target: "./src/Application/**/!(*.spec.ts|*.test.ts)",
              message:
                "Application層でPresentation層をimportしてはいけません。ユースケースはUI実装から独立して定義される必要があります。",
            },
            {
              from: "./src/Infrastructure/**/*",
              target: "./src/Application/**/!(*.spec.ts|*.test.ts)",
              message:
                "Application層でInfrastructure層を直接importしてはいけません。インターフェースを通じて依存性を逆転してください。",
            },
          ],
        },
      ],
    },
  },
  eslintConfigPrettier,
  {
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
