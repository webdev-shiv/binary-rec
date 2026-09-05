import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureDataSeeded } from '@/lib/seedHelper';

// Default Weighting Configuration: App 30%, PI1 35%, PI2 35% etc.
export async function GET() {
  try {
    await ensureDataSeeded();
    const cycle = await db.recruitmentCycle.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (!cycle) return NextResponse.json({ rankings: [] });

    const piRounds = await db.pIRound.findMany({
      where: { recruitmentCycleId: cycle.id },
      orderBy: { roundNumber: 'asc' },
    });

    const participants = await db.participant.findMany({
      where: { recruitmentCycleId: cycle.id },
      include: {
        piScores: true,
        finalResult: true,
      },
    });

    const formatted = participants.map((p) => {
      const piRoundScores: Record<string, number> = {};
      let sumPIScores = 0;

      p.piScores.forEach((s) => {
        piRoundScores[s.piRoundId] = s.overallScore;
        sumPIScores += s.overallScore;
      });

      return {
        id: p.id,
        name: p.name,
        rollNo: p.rollNo,
        branch: p.branch,
        section: p.section,
        primaryDomain: p.primaryDomain,
        piScoresCount: p.piScores.length,
        piRoundScores,
        applicationScore: p.finalResult?.applicationScore || 80, // Default base application score out of 100
        totalScore: p.finalResult?.totalScore || sumPIScores,
        finalRank: p.finalResult?.finalRank || 0,
        selectionStatus: p.finalResult?.selectionStatus || 'PENDING',
        remarks: p.finalResult?.remarks || '',
        recommendation: p.piScores.length > 0 ? p.piScores[p.piScores.length - 1].recommendation : 'PENDING',
      };
    });

    // Sort by totalScore desc to determine live rank
    formatted.sort((a, b) => b.totalScore - a.totalScore);
    formatted.forEach((item, index) => {
      item.finalRank = index + 1;
    });

    return NextResponse.json({
      cycle,
      piRounds,
      rankings: formatted,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch rankings' }, { status: 500 });
  }
}

// Recalculate Scores based on Admin Weights or Auto-Select Top N Candidates
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, topN, weights, selectionStage = 'SELECTED' } = body;

    const cycle = await db.recruitmentCycle.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (!cycle) {
      return NextResponse.json({ error: 'No active recruitment cycle' }, { status: 400 });
    }

    if (action === 'RECALCULATE') {
      // weights format: { appWeight: 30, piWeights: { roundId1: 35, roundId2: 35 } }
      const participants = await db.participant.findMany({
        where: { recruitmentCycleId: cycle.id },
        include: { piScores: true, finalResult: true },
      });

      const appWeight = (weights?.appWeight ?? 30) / 100;

      for (const p of participants) {
        const appScore = p.finalResult?.applicationScore || 80;
        let weightedPI = 0;

        p.piScores.forEach((score) => {
          const roundW = (weights?.piWeights?.[score.piRoundId] ?? 35) / 100;
          weightedPI += score.overallScore * roundW;
        });

        const totalScore = appScore * appWeight + weightedPI;

        await db.finalResult.upsert({
          where: { participantId: p.id },
          update: { totalScore },
          create: { participantId: p.id, totalScore },
        });
      }

      // Re-rank all candidates
      const updatedFinals = await db.finalResult.findMany({
        where: { participant: { recruitmentCycleId: cycle.id } },
        orderBy: { totalScore: 'desc' },
      });

      for (let i = 0; i < updatedFinals.length; i++) {
        await db.finalResult.update({
          where: { id: updatedFinals[i].id },
          data: { finalRank: i + 1 },
        });
      }

      return NextResponse.json({ success: true, message: 'Scores and ranks updated' });
    }

    if (action === 'AUTO_SELECT_TOP_N') {
      const count = Number(topN);
      if (!count || count <= 0) {
        return NextResponse.json({ error: 'Valid topN integer required' }, { status: 400 });
      }

      const allRanked = await db.finalResult.findMany({
        where: { participant: { recruitmentCycleId: cycle.id } },
        orderBy: { totalScore: 'desc' },
      });

      for (let i = 0; i < allRanked.length; i++) {
        const status = i < count ? selectionStage : 'REJECTED';
        await db.finalResult.update({
          where: { id: allRanked[i].id },
          data: {
            finalRank: i + 1,
            selectionStatus: status,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Top ${count} candidates updated to ${selectionStage}`,
        selectedCount: Math.min(count, allRanked.length),
      });
    }

    if (action === 'FINALIZE') {
      await db.finalResult.updateMany({
        where: { participant: { recruitmentCycleId: cycle.id } },
        data: { finalizedAt: new Date() },
      });
      return NextResponse.json({ success: true, message: 'Recruitment results finalized!' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ranking operation failed' }, { status: 500 });
  }
}
