import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { userId: string; fileName: string } }
) {
  try {
    const session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Users can only access their own PDFs
    if (session.user.id !== params.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const uploadDir = process.env.UPLOAD_DIR || '/app/uploads';
    const userDir = path.join(uploadDir, params.userId);
    const filePath = path.join(userDir, params.fileName);
    const resolvedFilePath = path.resolve(filePath);
    const resolvedUserDir = path.resolve(userDir) + path.sep;

    if (!resolvedFilePath.startsWith(resolvedUserDir)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ message: 'File not found' }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await readFile(filePath);

    // Return the PDF with appropriate headers
    const safeFileName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${safeFileName}"`,
      },
    });
  } catch (error: unknown) {
    console.error('Error serving PDF:', error);
    return NextResponse.json({ message: 'Error serving file' }, { status: 500 });
  }
}
