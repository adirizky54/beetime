import { defineConfig } from "drizzle-kit";
import { env } from "@beetime/env/api";

export default defineConfig({
  out: "./src/database/migrations",
  schema: "./src/database/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  migrations: {
    table: "drizzle_migrations",
    schema: "public",
  },
});
