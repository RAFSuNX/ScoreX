import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PDFExtract } from 'pdf.js-extract';
import formidable from 'formidable';
import fs from 'fs';

// Disable Next.js body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const form = formidable({});
    const [fields, files] = await form.parse(req);

    if (!files.pdfFile || files.pdfFile.length === 0) {
      return NextResponse.json({ message: 'No PDF file uploaded' }, { status: 400 });
    }

    const pdfFile = files.pdfFile[0];

    if (pdfFile.mimetype !== 'application/pdf') {
      return NextResponse.json({ message: 'Only PDF files are allowed' }, { status: 400 });
    }

    if (pdfFile.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json({ message: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const pdfExtract = new PDFExtract();
    const data = await pdfExtract.extract(pdfFile.filepath, {});

    let extractedText = '';
    for (const page of data.pages) {
      for (const content of page.content) {
        if ('str' in content) {
          extractedText += content.str + ' ';
        }
      }
    }

    // Clean up temporary file
    fs.unlink(pdfFile.filepath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

    // For now, return a dummy URL. In a real app, this would be the URL from cloud storage.
    const dummySourcePdfUrl = `https://example.com/pdfs/${pdfFile.newFilename}.pdf`; 

    return NextResponse.json({ extractedText, sourcePdfUrl: dummySourcePdfUrl }, { status: 200 });

  } catch (error) {
    console.error('Error during PDF upload and extraction:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: `PDF extraction failed: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred during PDF processing.' }, { status: 500 });
  }
}
