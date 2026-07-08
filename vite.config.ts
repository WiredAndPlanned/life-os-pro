/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// Life OS Pro — build configuration.
// Path aliases mirror the layered architecture defined in the Phase 0 ADR:
// tokens -> shared design tokens (Phase 1)
// ui     -> shared component library (Phase 2)
// data   -> persistence + CRUD + reflection layer (Phase 3)
// modules-> the nineteen product modules (Phase 4-5)
// app    -> shell, routing, providers (Phase 0)
//
// Aliases are resolved from the project root. Vite always runs its config with
// the project root as the working directory, so process.cwd() is the root; this
// resolves absolute paths that typecheck cleanly under tsconfig.node.json
// (no dependency on import.meta typing).
const root = process.cwd();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@app": resolve(root, "src/app"),
      "@tokens": resolve(root, "src/tokens"),
      "@ui": resolve(root, "src/ui"),
      "@data": resolve(root, "src/data"),
      "@modules": resolve(root, "src/modules"),
      "@lib": resolve(root, "src/lib"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
