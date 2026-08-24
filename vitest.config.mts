import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
