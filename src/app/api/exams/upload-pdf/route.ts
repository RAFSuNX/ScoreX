import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { PDFExtract } from 'pdf.js-extract';
import type { Session } from 'next-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { rateLimiters, getClientIp, createRateLimitResponse } from '@/lib/rate-limit';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let session: Session | null = null;
  try {
    const rateLimit = await rateLimiters.fileUpload.check(20, getClientIp(req));
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit.resetTime);
    }

    session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.plan === 'FREE') {
      return NextResponse.json(
        { message: 'PDF uploads are a Pro feature. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const pdfFile = formData.get('pdfFile') as File | null;

    if (!pdfFile) {
      return NextResponse.json({ message: 'No PDF file uploaded' }, { status: 400 });
    }

    if (pdfFile.type !== 'application/pdf') {
      return NextResponse.json({ message: 'Only PDF files are allowed' }, { status: 400 });
    }

    if (pdfFile.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json({ message: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Convert File to Buffer for pdf.js-extract
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const signature = buffer.subarray(0, 4).toString('utf8');
    if (signature !== '%PDF') {
      return NextResponse.json(
        { message: 'Invalid PDF file' },
        { status: 400 }
      );
    }

    const pdfExtract = new PDFExtract();
    const data = await pdfExtract.extractBuffer(buffer, {}); // Use extractBuffer

    let extractedText = '';
    for (const page of data.pages) {
      for (const content of page.content) {
        if ('str' in content) {
          extractedText += content.str + ' ';
        }
      }
    }

    // Save PDF to local storage
    const uploadDir = process.env.UPLOAD_DIR || '/app/uploads';
    const userDir = path.join(uploadDir, session.user.id);

    // Create user directory if it doesn't exist
    if (!existsSync(userDir)) {
      await mkdir(userDir, { recursive: true });
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFileName = pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${sanitizedFileName}`;
    const filePath = path.join(userDir, fileName);

    // Save the PDF file
    await writeFile(filePath, buffer);

    // Generate URL path for the PDF
    const sourcePdfUrl = `/uploads/${session.user.id}/${fileName}`;

    logger.info('PDF uploaded and extracted successfully', {
      fileName: pdfFile.name,
      savedPath: filePath,
      textLength: extractedText.length,
      userId: session.user.id
    });
    return NextResponse.json({ extractedText, sourcePdfUrl }, { status: 200 });

  } catch (error: unknown) {
    logger.error('Error during PDF upload and extraction', error, { userId: session?.user?.id });
    if (error instanceof Error) {
        return NextResponse.json({ message: `PDF extraction failed: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred during PDF processing.' }, { status: 500 });
  }
}
