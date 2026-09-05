import { db } from './db';
import { OFFICIAL_150_SHORTLIST } from './students150';

export async function ensureDataSeeded() {
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

    const count = await db.participant.count({
      where: { recruitmentCycleId: cycle.id },
    });

    if (count > 0) return cycle;

    // Check if PI Round exists
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
            technicalMax: 25,
            publicSpeakingMax: 25,
            projectMax: 25,
            overallMax: 25,
          }),
        },
      });
    }

    // Seed all 150 candidates
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
          overallScore: Math.round(s.score * 0.25),
          technicalScore: Math.round(s.score * 0.25),
          problemSolvingScore: Math.round(s.score * 0.25),
          communicationScore: Math.round(s.score * 0.25),
          domainKnowledgeScore: Math.round(s.score * 0.25),
          projectScore: Math.round(s.score * 0.25),
          attitudeScore: Math.round(s.score * 0.25),
          contributionScore: Math.round(s.score * 0.25),
          recommendation: s.rank <= 50 ? 'STRONGLY_RECOMMEND' : 'RECOMMEND',
          scoredBy: 'Official Committee',
        },
      });
    }

    return cycle;
  } catch (err) {
    console.error('Auto seed helper error:', err);
    return null;
  }
}
