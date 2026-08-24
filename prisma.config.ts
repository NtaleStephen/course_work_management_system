import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js reads .env.local itself; the Prisma CLI does not, so load it explicitly
// here rather than keeping a second, easily-out-of-sync .env file.
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // CLI-only (migrate/db pull/studio): direct connection, not the pooled one,
    // since migrations need DDL/shadow-db support that transaction pooling breaks.
    // The running app connects separately via lib/db/client.ts using DATABASE_URL
    // (the pooled connection) through the @prisma/adapter-pg driver adapter.
    url: process.env["DIRECT_URL"],
  },
});
