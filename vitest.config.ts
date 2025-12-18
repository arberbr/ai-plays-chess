import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./setupTests.ts",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: ["**/node_modules/**", "src/app/**", "e2e/**", "**/*.d.ts"]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@/": path.resolve(__dirname, "src") + "/"
    }
  }
});
