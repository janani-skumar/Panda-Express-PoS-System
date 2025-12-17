import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle/migrations',
  schema: './drizzle/src/db/schema.ts',
  dialect: 'postgresql',  // Changed from driver: 'pg'
  dbCredentials: {
    url: process.env.DATABASE_URL!,  // Changed from connectionString
  },
});
