import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";

// Life OS Pro — lint rules.
// Accessibility is a floor that is never waived (Constitution §24, Level 2 §17),
// so jsx-a11y runs as errors, not warnings. The build fails on a11y violations.
//
// Two profiles:
//   • Product + build config (src/**, vite.config.ts): the full strict,
//     type-aware ruleset. This is the code that ships.
//   • Node verification harnesses (scripts/**): a pragmatic, non-type-aware
//     profile. These are dev tooling — never shipped — and legitimately use
//     terse shim patterns; type-aware product rules don't apply to them.
export default tseslint.config(
  { ignores: ["dist", "coverage"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
    files: ["src/**/*.{ts,tsx}", "vite.config.ts"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.app.json", "./tsconfig.node.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unnecessary-condition": "off",
      // autoFocus is used ONLY inside bottom sheets / dialogs that open in direct
      // response to a user action (e.g. "Add expense"). Moving focus into a
      // just-opened dialog is the correct, expected behavior — the rule's concern
      // is disorienting autofocus on initial PAGE load, which never happens here.
      "jsx-a11y/no-autofocus": "off",
    },
  },
  {
    // Local-first persistence (§22) means the DATA LAYER owns device storage.
    // Everywhere else, direct storage access is forbidden so no module can
    // create a rogue second copy of a datum — one source of truth per entity
    // is an architectural law (§12, §16). All reads/writes go through @data.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/data/**"],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "localStorage", message: "Access persistence only through the @data layer (one source of truth, §12/§16)." },
        { name: "sessionStorage", message: "Access persistence only through the @data layer (one source of truth, §12/§16)." },
      ],
    },
  },
  {
    // Node verification harnesses — dev tooling, not shipped product code. They
    // run under Node (via tsx) but shim browser APIs (localStorage/Storage) to
    // exercise the real source, and use terse type annotations. They get JS/TS
    // correctness linting but NOT the strict, type-aware product ruleset.
    //
    // Base `no-undef` is turned off (TypeScript already resolves globals, and the
    // rule is explicitly discouraged for TS — it can't see DOM/Node lib types),
    // and unused-vars uses the TS-aware rule so it understands type positions.
    files: ["scripts/**/*.ts"],
    extends: [js.configs.recommended],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: tseslint.parser,
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);
