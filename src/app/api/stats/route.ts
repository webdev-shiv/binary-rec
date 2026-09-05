import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureDataSeeded } from '@/lib/seedHelper';

export async function GET() {
  try {
    await ensureDataSeeded();
    const cycle = await db.recruitmentCycle.findFirst({ where: { status: 'ACTIVE' } });
    if (!cycle) {
      return NextResponse.json({
        totalApplicants: 0,
        shortlistedCount: 0,
        piPendingCount: 0,
        piCompletedCount: 0,
        selectedCount: 0,
        rejectedCount: 0,
        averagePIScore: 0,
        topCandidates: [],
        branchStats: [],
        sectionStats: [],
        domainStats: [],
        genderStats: [],
        yearStats: [],
        piScoreDistribution: [],
        selectionStats: [],
      });
    }

    const participants = await db.participant.findMany({
      where: { recruitmentCycleId: cycle.id },
      include: { piScores: true, finalResult: true },
    });

    const totalApplicants = participants.length;

    let shortlistedCount = 0;
    let selectedCount = 0;
    let rejectedCount = 0;
    let piCompletedCount = 0;
    let totalPIScoreSum = 0;
    let piScoredCandidatesCount = 0;

    const branchCounts: Record<string, number> = {};
    const sectionCounts: Record<string, number> = {};
    const domainCounts: Record<string, number> = {};
    const genderCounts: Record<string, number> = {};
    const yearCounts: Record<string, number> = {};
    const selectionCounts: Record<string, number> = { PENDING: 0, SHORTLISTED: 0, SELECTED: 0, REJECTED: 0 };
    const scoreBuckets = { '0-40': 0, '41-60': 0, '61-75': 0, '76-90': 0, '91-100': 0 };

    participants.forEach((p) => {
      // Branch & Section
      branchCounts[p.branch] = (branchCounts[p.branch] || 0) + 1;
      sectionCounts[p.section] = (sectionCounts[p.section] || 0) + 1;

      // Domain
      domainCounts[p.primaryDomain] = (domainCounts[p.primaryDomain] || 0) + 1;

      // Gender & Year
      genderCounts[p.gender] = (genderCounts[p.gender] || 0) + 1;
      yearCounts[p.year] = (yearCounts[p.year] || 0) + 1;

      // Selection status
      const status = p.finalResult?.selectionStatus || 'PENDING';
      selectionCounts[status] = (selectionCounts[status] || 0) + 1;

      if (status === 'SHORTLISTED') shortlistedCount++;
      if (status === 'SELECTED') selectedCount++;
      if (status === 'REJECTED') rejectedCount++;

      // PI metrics
      if (p.piScores.length > 0) {
        piCompletedCount++;
        const pAvg = p.piScores.reduce((acc, s) => acc + s.overallScore, 0) / p.piScores.length;
        totalPIScoreSum += pAvg;
        piScoredCandidatesCount++;

        if (pAvg <= 40) scoreBuckets['0-40']++;
        else if (pAvg <= 60) scoreBuckets['41-60']++;
        else if (pAvg <= 75) scoreBuckets['61-75']++;
        else if (pAvg <= 90) scoreBuckets['76-90']++;
        else scoreBuckets['91-100']++;
      }
    });

    const piPendingCount = totalApplicants - piCompletedCount;
    const averagePIScore = piScoredCandidatesCount > 0 ? totalPIScoreSum / piScoredCandidatesCount : 0;

    // Top candidates spotlight
    const sortedCandidates = [...participants].sort((a, b) => {
      const scoreA = a.finalResult?.totalScore ?? (a.piScores[0]?.overallScore || 0);
      const scoreB = b.finalResult?.totalScore ?? (b.piScores[0]?.overallScore || 0);
      return scoreB - scoreA;
    });

    const topCandidates = sortedCandidates.slice(0, 5).map((p) => ({
      id: p.id,
      name: p.name,
      rollNo: p.rollNo,
      branch: p.branch,
      section: p.section,
      domain: p.primaryDomain,
      score: p.finalResult?.totalScore ?? (p.piScores[0]?.overallScore || 0),
      rank: p.finalResult?.finalRank || 1,
      status: p.finalResult?.selectionStatus || 'PENDING',
    }));

    return NextResponse.json({
      totalApplicants,
      shortlistedCount,
      piPendingCount,
      piCompletedCount,
      selectedCount,
      rejectedCount,
      averagePIScore: Number(averagePIScore.toFixed(1)),
      topCandidates,
      branchStats: Object.entries(branchCounts).map(([name, value]) => ({ name, value })),
      sectionStats: Object.entries(sectionCounts).map(([name, value]) => ({ name, value })),
      domainStats: Object.entries(domainCounts).map(([name, value]) => ({ name, value })),
      genderStats: Object.entries(genderCounts).map(([name, value]) => ({ name, value })),
      yearStats: Object.entries(yearCounts).map(([name, value]) => ({ name, value })),
      piScoreDistribution: Object.entries(scoreBuckets).map(([range, count]) => ({ range, count })),
      selectionStats: Object.entries(selectionCounts).map(([name, value]) => ({ name, value })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Stats calculation failed' }, { status: 500 });
  }
}
