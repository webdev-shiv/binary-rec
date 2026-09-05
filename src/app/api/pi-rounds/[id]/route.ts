import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.pIRound.update({
      where: { id },
      data: {
        roundName: body.roundName,
        description: body.description,
        maxScore: Number(body.maxScore),
        status: body.status,
        scoringCriteria: body.criteria ? JSON.stringify(body.criteria) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      piRound: {
        ...updated,
        criteria: JSON.parse(updated.scoringCriteria),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update PI round' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.pIRound.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete PI round' }, { status: 500 });
  }
}
