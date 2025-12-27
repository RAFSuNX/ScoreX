import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimiters, getClientIp, createRateLimitResponse } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIp = getClientIp(request);

  // Apply rate limiting based on route
  if (pathname.startsWith('/api/auth/')) {
    // Rate limit auth endpoints (5 per 15 minutes)
    const result = await rateLimiters.auth.check(5, clientIp);
    if (!result.success) {
      return createRateLimitResponse(result.resetTime);
    }
  } else if (pathname.startsWith('/api/ai/generate')) {
    // Rate limit AI generation (10 per hour)
    const result = await rateLimiters.aiGeneration.check(10, clientIp);
    if (!result.success) {
      return createRateLimitResponse(result.resetTime);
    }
  } else if (pathname.startsWith('/api/exams/upload-pdf')) {
    // Rate limit file uploads (20 per hour)
    const result = await rateLimiters.fileUpload.check(20, clientIp);
    if (!result.success) {
      return createRateLimitResponse(result.resetTime);
    }
  } else if (pathname.startsWith('/api/')) {
    // General API rate limit (100 per minute)
    const result = await rateLimiters.api.check(100, clientIp);
    if (!result.success) {
      return createRateLimitResponse(result.resetTime);
    }
  }

  // Add security headers
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://openrouter.ai; " +
    "frame-ancestors 'self';"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
