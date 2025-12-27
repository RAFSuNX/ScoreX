import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Plan } from '@prisma/client'; // Import Plan enum from Prisma Client

// Define monthly exam limits based on user plan
const MONTHLY_EXAM_LIMITS: Record<Plan, number> = {
  FREE: 5,
  PRO: 50, // Example: 50 exams per month for Pro users
  PREMIUM: 9999, // Effectively unlimited for Premium
};

const createExamSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().optional(),
  sourceType: z.enum(['PDF', 'DESCRIPTION']),
  sourceText: z.string().optional(),
  sourcePdfUrl: z.string().optional(), // Added for PDF handling
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  subject: z.string().min(3, 'Subject must be at least 3 characters long'),
  aiModel: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user's plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const limit = MONTHLY_EXAM_LIMITS[user.plan];
    if (limit === 9999) { // Unlimited plan
        // Do nothing, no quota check needed
    } else {
        // Calculate the start of the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Count exams created by the user in the current month
        const currentMonthExamsCount = await prisma.exam.count({
            where: {
                userId: userId,
                createdAt: {
                    gte: startOfMonth,
                },
            },
        });

        if (currentMonthExamsCount >= limit) {
            return NextResponse.json(
                { message: `Monthly exam quota exceeded. You can create ${limit} exams per month on your ${user.plan} plan.` },
                { status: 403 }
            );
        }
    }

    const body = await req.json();
    const { title, description, sourceType, sourceText, sourcePdfUrl, difficulty, subject, aiModel } = createExamSchema.parse(body);

    if (sourceType === 'DESCRIPTION' && !sourceText) {
      return NextResponse.json({ message: 'Source text is required for description-based exams' }, { status: 400 });
    }
    // New validation for PDF type: ensure sourcePdfUrl is present
    if (sourceType === 'PDF' && !sourcePdfUrl) {
        return NextResponse.json({ message: 'Source PDF URL is required for PDF-based exams' }, { status: 400 });
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        sourceType,
        sourceText: sourceType === 'DESCRIPTION' ? sourceText : null,
        sourcePdfUrl: sourceType === 'PDF' ? sourcePdfUrl : null, // Conditionally save sourcePdfUrl
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
