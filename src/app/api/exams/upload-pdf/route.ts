import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PDFExtract } from 'pdf.js-extract';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
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

    // In a real app, you would upload the PDF to cloud storage (e.g., S3)
    // and get a public URL here. For now, use a dummy URL.
    const dummySourcePdfUrl = `https://example.com/pdfs/${pdfFile.name}`; 

    return NextResponse.json({ extractedText, sourcePdfUrl: dummySourcePdfUrl }, { status: 200 });

  } catch (error: any) {
    console.error('Error during PDF upload and extraction:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: `PDF extraction failed: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred during PDF processing.' }, { status: 500 });
  }
}
