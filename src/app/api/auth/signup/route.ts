import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { rateLimiters, getClientIp, createRateLimitResponse } from '@/lib/rate-limit';

export const dynamic = "force-dynamic";

const signupSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
});

type SignupPayload = z.infer<typeof signupSchema>;

export async function POST(req: Request) {
  try {
    const rateLimit = await rateLimiters.auth.check(5, getClientIp(req));
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit.resetTime);
    }

    const body = (await req.json()) as SignupPayload;
    const { name, email, password } = signupSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Unable to create account' },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    logger.info('User created successfully', { email });
    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      logger.warn('Signup validation failed', { issues: error.issues });
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    logger.error('Signup error', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
