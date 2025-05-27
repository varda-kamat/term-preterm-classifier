import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
const sql = neon("postgresql://neondb_owner:Xz4IA0jcYUeD@ep-yellow-grass-a52kudbb.us-east-2.aws.neon.tech/hospital?sslmode=require");
export const db = drizzle(sql);
