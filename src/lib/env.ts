import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().min(1, 'DATABASE_URL is required'),

  // NextAuth
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters long'),
  NEXTAUTH_URL: z.string().url().min(1, 'NEXTAUTH_URL is required'),

  // OpenRouter API
  OPENROUTER_API_KEY: z
    .string()
    .min(1, 'OPENROUTER_API_KEY is required')
    .startsWith('sk-or-v1-', 'OPENROUTER_API_KEY must be a valid API key'),

  // Optional: AI Model
  AI_MODEL_GENERATION: z.string().optional().default('openai/gpt-3.5-turbo'),

  // Node Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

// Validate environment variables
const parseEnv = () => {
  // Skip validation during build time (environment variables not available)
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return {} as z.infer<typeof envSchema>;
  }

  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      });
      throw new Error('Environment validation failed');
    }
    throw error;
  }
};

// Export validated environment variables
export const env = parseEnv();
