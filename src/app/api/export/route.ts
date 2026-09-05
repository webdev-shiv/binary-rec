import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateCSV, generateExcelBuffer, generatePDFBuffer, ExportCandidateData } from '@/lib/export-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'csv').toLowerCase();
    const branch = searchParams.get('branch') || '';
    const section = searchParams.get('section') || '';
    const domain = searchParams.get('domain') || '';
    const status = searchParams.get('status') || '';

    const cycle = await db.recruitmentCycle.findFirst({ where: { status: 'ACTIVE' } });
    if (!cycle) return NextResponse.json({ error: 'No active recruitment cycle' }, { status: 400 });

    const where: any = { recruitmentCycleId: cycle.id };
    if (branch && branch !== 'ALL') where.branch = branch;
    if (section && section !== 'ALL') where.section = section;
    if (domain && domain !== 'ALL') {
      where.OR = [{ primaryDomain: domain }, { allDomains: { contains: domain } }];
    }
    if (status && status !== 'ALL') {
      where.finalResult = { selectionStatus: status };
    }

    const participants = await db.participant.findMany({
      where,
      include: { piScores: true, finalResult: true },
      orderBy: { name: 'asc' },
    });

    const exportData: ExportCandidateData[] = participants.map((p) => {
      const avgPIScore = p.piScores.length > 0
        ? p.piScores.reduce((acc, s) => acc + s.overallScore, 0) / p.piScores.length
        : undefined;

      return {
        rank: p.finalResult?.finalRank || '-',
        name: p.name,
        rollNo: p.rollNo,
        branch: p.branch,
        section: p.section,
        year: p.year,
        gender: p.gender,
        primaryDomain: p.primaryDomain,
        email: p.email,
        contactNo: p.contactNo,
        piScore: avgPIScore,
        finalScore: p.finalResult?.totalScore,
        selectionStatus: p.finalResult?.selectionStatus || 'PENDING',
        recommendation: p.piScores.length > 0 ? p.piScores[p.piScores.length - 1].recommendation : undefined,
      };
    });

    if (format === 'csv') {
      const csvStr = generateCSV(exportData);
      return new NextResponse(csvStr, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="Binary_Club_Recruitment_${Date.now()}.csv"`,
        },
      });
    }

    if (format === 'excel' || format === 'xlsx') {
      const excelBuf = generateExcelBuffer(exportData);
      return new NextResponse(new Uint8Array(excelBuf), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="Binary_Club_Recruitment_${Date.now()}.xlsx"`,
        },
      });
    }

    if (format === 'pdf') {
      const pdfBuf = generatePDFBuffer(exportData, `BINARY CLUB — RECRUITMENT REPORT (${status || 'ALL'})`);
      return new NextResponse(new Uint8Array(pdfBuf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Binary_Club_Recruitment_${Date.now()}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Export failed' }, { status: 500 });
  }
}
