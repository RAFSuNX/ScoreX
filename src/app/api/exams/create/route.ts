import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const createExamSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().optional(),
  sourceType: z.enum(['PDF', 'DESCRIPTION']),
  sourceText: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  subject: z.string().min(3, 'Subject must be at least 3 characters long'),
  aiModel: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    console.log('Session in /api/exams/create:', JSON.stringify(session, null, 2));

    if (!session || !session.user || !session.user.id) {
      console.log('Session validation failed:', { hasSession: !!session, hasUser: !!session?.user, hasId: !!session?.user?.id });
      return NextResponse.json({ message: 'Unauthorized - Please sign out and sign back in' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, sourceType, sourceText, difficulty, subject, aiModel } = createExamSchema.parse(body);

    if (sourceType === 'DESCRIPTION' && !sourceText) {
      return NextResponse.json({ message: 'Source text is required for description-based exams' }, { status: 400 });
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        sourceType,
        sourceText: sourceType === 'DESCRIPTION' ? sourceText : null,
        difficulty,
        subject,
        userId: session.user.id,
        aiModel: aiModel || 'default-model',
      },
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
