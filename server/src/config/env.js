import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  // TiDB Database
  TIDB_HOST: z.string().optional().default('localhost'),
  TIDB_PORT: z.coerce.number().default(4000),
  TIDB_USER: z.string().optional().default('root'),
  TIDB_PASSWORD: z.string().optional().default(''),
  TIDB_DATABASE: z.string().optional().default('sys'),
  TIDB_CA_PATH: z.string().optional().default('cert/isrgrootx1.pem'),

  // JWT Configuration
  JWT_ACCESS_SECRET: z.string().default('dev-jwt-access-secret-key-super-secure-32chars'),
  JWT_REFRESH_SECRET: z.string().default('dev-jwt-refresh-secret-key-super-secure-32chars'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export default env;
