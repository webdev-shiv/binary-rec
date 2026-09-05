import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { OFFICIAL_150_SHORTLIST } from '@/lib/students150';

export async function POST() {
  try {
    let cycle = await db.recruitmentCycle.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (!cycle) {
      cycle = await db.recruitmentCycle.create({
        data: {
          name: 'Binary Club Core Recruitment 2026',
          year: 2026,
          status: 'ACTIVE',
        },
      });
    }

    // Clear old data so ONLY the 225 official candidates exist
    await db.pIScore.deleteMany({});
    await db.finalResult.deleteMany({});
    await db.participant.deleteMany({});

    // Get default PI round 1
    let piRound = await db.pIRound.findFirst({
      where: { recruitmentCycleId: cycle.id },
    });

    if (!piRound) {
      piRound = await db.pIRound.create({
        data: {
          recruitmentCycleId: cycle.id,
          roundName: 'PI Round 1 — Technical & Problem Solving',
          roundNumber: 1,
          description: 'First stage Personal Interview covering domain fundamentals, coding, and communication.',
          maxScore: 100,
          status: 'ACTIVE',
          scoringCriteria: JSON.stringify({
            technicalMax: 20,
            problemSolvingMax: 20,
            communicationMax: 15,
            domainMax: 15,
            projectMax: 15,
            attitudeMax: 10,
            contributionMax: 5,
          }),
        },
      });
    }

    for (const s of OFFICIAL_150_SHORTLIST) {
      const email = s.email || `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${s.rollNo.slice(-4)}@binaryclub.org`;
      
      const p = await db.participant.create({
        data: {
          recruitmentCycleId: cycle.id,
          rollNo: s.rollNo,
          name: s.name,
          email: email,
          contactNo: s.contactNo || '',
          instagramId: s.instagramId || '',
          linkedinId: s.linkedinId || '',
          year: '2nd Year',
          branch: s.branch,
          section: s.section,
          primaryDomain: s.primaryDomain,
          allDomains: JSON.stringify(s.allDomains),
          technicalSkills: s.technicalSkills || s.allDomains.join(', '),
          skills: s.technicalSkills || s.allDomains.join(', '),
          projects: s.projects || (s.projectLink ? `Project link: ${s.projectLink}` : `Project in ${s.primaryDomain}`),
          contributionStrengths: s.contributionStrengths || '',
          whyBinaryClub: s.whyBinaryClub || `Passionate about ${s.primaryDomain} and Binary Club activities.`,
          eventIdeas: s.eventIdeas || '',
          threeWords: s.threeWords || '',
          rawFormData: JSON.stringify(s),
        },
      });

      await db.finalResult.create({
        data: {
          participantId: p.id,
          totalScore: s.score,
          finalRank: s.rank,
          applicationScore: Math.round(s.score * 0.4),
          selectionStatus: 'SHORTLISTED',
        },
      });

      await db.pIScore.create({
        data: {
          participantId: p.id,
          piRoundId: piRound.id,
          overallScore: s.score,
          technicalScore: Math.round(s.score * 0.3),
          problemSolvingScore: Math.round(s.score * 0.25),
          communicationScore: Math.round(s.score * 0.15),
          domainKnowledgeScore: Math.round(s.score * 0.15),
          projectScore: Math.round(s.score * 0.15),
          recommendation: s.rank <= 50 ? 'STRONGLY_RECOMMEND' : 'RECOMMEND',
          scoredBy: 'Official Committee',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Database reset! Loaded ONLY the 225 official shortlisted candidates with full response form details.`,
      totalRecords: OFFICIAL_150_SHORTLIST.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to populate official candidates' }, { status: 500 });
  }
}
