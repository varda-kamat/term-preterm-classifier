import { defineConfig } from 'drizzle-kit'
export default defineConfig({
  schema: "./configs/dbSchema.jsx",
  dialect: 'postgresql',
  dbCredentials: {
    url: "postgresql://neondb_owner:Xz4IA0jcYUeD@ep-yellow-grass-a52kudbb.us-east-2.aws.neon.tech/hospital?sslmode=require",
  },
  verbose: true,
  strict: true,
})