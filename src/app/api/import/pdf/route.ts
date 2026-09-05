import { NextResponse } from 'next/server';
import { parseRecruitmentPDF } from '@/lib/pdf-parser';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file uploaded' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Uploaded file must be a PDF document' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    const parseResult = await parseRecruitmentPDF(pdfBuffer);

    return NextResponse.json({
      success: true,
      filename: file.name,
      candidateCount: parseResult.candidateCount,
      candidates: parseResult.candidates,
      warningsCount: parseResult.warningsCount,
      errorsCount: parseResult.errorsCount,
    });
  } catch (error: any) {
    console.error('PDF parsing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse recruitment PDF file' },
      { status: 500 }
    );
  }
}
