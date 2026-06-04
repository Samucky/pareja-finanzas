import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z
    .string()
    .min(1)
    .refine((uri) => !uri.includes('127.0.0.1') && !uri.includes('localhost'), {
      message:
        'MONGODB_URI apunta a localhost. En Render usa tu URI de Atlas (mongodb+srv://...).',
    }),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),
  CORS_ORIGIN: z.string().default('*'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variables de entorno inválidas:', parsed.error.flatten().fieldErrors);
  console.error(
    'En Render → Environment: define MONGODB_URI con mongodb+srv://...@cluster....mongodb.net/pareja_finanzas?...'
  );
  process.exit(1);
}

export const env = parsed.data;
