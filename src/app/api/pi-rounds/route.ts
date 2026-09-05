import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureDataSeeded } from '@/lib/seedHelper';

export async function GET() {
  try {
    await ensureDataSeeded();
    const cycle = await db.recruitmentCycle.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (!cycle) return NextResponse.json({ piRounds: [] });

    const piRounds = await db.pIRound.findMany({
      where: { recruitmentCycleId: cycle.id },
      include: {
        _count: {
          select: { piScores: true },
        },
      },
      orderBy: { roundNumber: 'asc' },
    });

    return NextResponse.json({
      piRounds: piRounds.map((r) => ({
        ...r,
        criteria: JSON.parse(r.scoringCriteria || '{}'),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch PI rounds' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roundName, description, maxScore = 100, criteria } = body;

    const cycle = await db.recruitmentCycle.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (!cycle) {
      return NextResponse.json({ error: 'No active recruitment cycle found' }, { status: 400 });
    }

    const roundCount = await db.pIRound.count({
      where: { recruitmentCycleId: cycle.id },
    });

    const defaultCriteria = {
      technicalMax: 20,
      problemSolvingMax: 20,
      communicationMax: 15,
      domainMax: 15,
      projectMax: 15,
      attitudeMax: 10,
      contributionMax: 5,
    };

    const newRound = await db.pIRound.create({
      data: {
        recruitmentCycleId: cycle.id,
        roundName: roundName || `PI Round ${roundCount + 1}`,
        roundNumber: roundCount + 1,
        description: description || '',
        maxScore: Number(maxScore) || 100,
        status: 'ACTIVE',
        scoringCriteria: JSON.stringify(criteria || defaultCriteria),
      },
    });

    return NextResponse.json({
      success: true,
      piRound: {
        ...newRound,
        criteria: JSON.parse(newRound.scoringCriteria),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create PI round' }, { status: 500 });
  }
}
