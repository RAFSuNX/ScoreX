import { NextResponse } from 'next/server';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// For production with multiple instances, use Redis
const rateLimitStore = new Map<string, RateLimitStore>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

export class RateLimiter {
  private interval: number;
  private uniqueTokenPerInterval: number;

  constructor(options: RateLimitOptions) {
    this.interval = options.interval;
    this.uniqueTokenPerInterval = options.uniqueTokenPerInterval;
  }

  async check(limit: number, token: string): Promise<{ success: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const key = `${token}`;

    const record = rateLimitStore.get(key);

    if (!record || record.resetTime < now) {
      // Create new record or reset expired one
      const resetTime = now + this.interval;
      rateLimitStore.set(key, { count: 1, resetTime });
      return { success: true, remaining: limit - 1, resetTime };
    }

    if (record.count >= limit) {
      return { success: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count++;
    return { success: true, remaining: limit - record.count, resetTime: record.resetTime };
  }
}

// Predefined rate limiters for different endpoints
export const rateLimiters = {
  // Auth endpoints: 5 requests per 15 minutes
  auth: new RateLimiter({
    interval: 15 * 60 * 1000,
    uniqueTokenPerInterval: 500,
  }),

  // API endpoints: 100 requests per minute
  api: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
  }),

  // AI generation: 10 requests per hour (expensive operation)
  aiGeneration: new RateLimiter({
    interval: 60 * 60 * 1000,
    uniqueTokenPerInterval: 500,
  }),

  // File upload: 20 requests per hour
  fileUpload: new RateLimiter({
    interval: 60 * 60 * 1000,
    uniqueTokenPerInterval: 500,
  }),
};

// Helper function to get client IP
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

// Helper to create rate limit response
export function createRateLimitResponse(resetTime: number) {
  const resetDate = new Date(resetTime);
  return NextResponse.json(
    {
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
    },
    {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
        'X-RateLimit-Reset': resetDate.toISOString(),
      },
    }
  );
}
