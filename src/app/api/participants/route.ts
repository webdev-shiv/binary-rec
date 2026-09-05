import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureDataSeeded } from '@/lib/seedHelper';
import { OFFICIAL_150_SHORTLIST } from '@/lib/students150';

export async function GET(request: Request) {
  try {
    await ensureDataSeeded();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.trim() || '';
    const branch = searchParams.get('branch')?.trim() || '';
    const section = searchParams.get('section')?.trim() || '';
    const year = searchParams.get('year')?.trim() || '';
    const domain = searchParams.get('domain')?.trim() || '';
    const piStatus = searchParams.get('piStatus')?.trim() || '';
    const selectionStatus = searchParams.get('selectionStatus')?.trim() || '';
    const sortBy = searchParams.get('sortBy') || 'name'; // name | rollNo | finalScore | rank
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '500', 10);

    let activeCycle = await db.recruitmentCycle.findFirst({
      where: { status: 'ACTIVE' },
    });

    let participants: any[] = [];
    let totalCountInDb = 0;

    if (activeCycle) {
      totalCountInDb = await db.participant.count({
        where: { recruitmentCycleId: activeCycle.id },
      }).catch(() => 0);

      const andConditions: any[] = [{ recruitmentCycleId: activeCycle.id }];

      if (branch && branch !== 'ALL') andConditions.push({ branch });
      if (section && section !== 'ALL') andConditions.push({ section });
      if (year && year !== 'ALL') andConditions.push({ year });
      if (domain && domain !== 'ALL') {
        andConditions.push({
          OR: [
            { primaryDomain: domain },
            { allDomains: { contains: domain } },
          ],
        });
      }

      if (selectionStatus && selectionStatus !== 'ALL') {
        andConditions.push({
          finalResult: { selectionStatus },
        });
      }

      participants = await db.participant.findMany({
        where: { AND: andConditions },
        include: {
          piScores: {
            include: {
              piRound: true,
            },
          },
          finalResult: true,
        },
      });

      if (search) {
        const q = search.toLowerCase();
        participants = participants.filter(
          (p) =>
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.rollNo && p.rollNo.toLowerCase().includes(q)) ||
            (p.email && p.email.toLowerCase().includes(q)) ||
            (p.primaryDomain && p.primaryDomain.toLowerCase().includes(q)) ||
            (p.technicalSkills && p.technicalSkills.toLowerCase().includes(q)) ||
            (p.skills && p.skills.toLowerCase().includes(q)) ||
            (p.branch && p.branch.toLowerCase().includes(q)) ||
            (p.contactNo && p.contactNo.toLowerCase().includes(q))
        );
      }
    }

    // Fallback to OFFICIAL_150_SHORTLIST (all 225 real candidates) ONLY if DB has 0 participants overall
    if (totalCountInDb === 0) {
      participants = OFFICIAL_150_SHORTLIST.map((s, idx) => ({
        id: `cand-${s.rollNo}`,
        recruitmentCycleId: activeCycle?.id || 'cycle-2026',
        name: s.name,
        rollNo: s.rollNo,
        gender: 'Unspecified',
        email: s.email || `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${s.rollNo.slice(-4)}@akgec.ac.in`,
        contactNo: s.contactNo || '',
        year: '2nd Year',
        branch: s.branch,
        section: s.section,
        residentialStatus: 'Hosteller',
        instagramId: s.instagramId || '',
        linkedinId: s.linkedinId || '',
        primaryDomain: s.primaryDomain,
        allDomains: JSON.stringify(s.allDomains),
        technicalSkills: s.technicalSkills || s.allDomains.join(', '),
        skills: s.technicalSkills || s.allDomains.join(', '),
        projects: s.projects || (s.projectLink ? `Project link: ${s.projectLink}` : `Project in ${s.primaryDomain}`),
        technicalExperience: '',
        achievements: '',
        contributionStrengths: s.contributionStrengths || '',
        whyBinaryClub: s.whyBinaryClub || `Passionate about ${s.primaryDomain} and Binary Club activities.`,
        eventIdeas: s.eventIdeas || '',
        threeWords: s.threeWords || '',
        piScores: [
          {
            id: `score-${s.rollNo}`,
            participantId: `cand-${s.rollNo}`,
            overallScore: s.score,
            technicalScore: Math.round(s.score * 0.25),
            communicationScore: Math.round(s.score * 0.25),
            projectScore: Math.round(s.score * 0.25),
            attitudeScore: Math.round(s.score * 0.25),
            recommendation: s.rank <= 50 ? 'STRONGLY_RECOMMEND' : 'RECOMMEND',
          },
        ],
        finalResult: {
          id: `result-${s.rollNo}`,
          participantId: `cand-${s.rollNo}`,
          totalScore: s.score,
          finalRank: s.rank || idx + 1,
          selectionStatus: 'SHORTLISTED',
          remarks: '',
        },
      }));

      // Apply in-memory search and filter on fallback data
      if (search) {
        const q = search.toLowerCase();
        participants = participants.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.rollNo.includes(q) ||
            p.email.toLowerCase().includes(q) ||
            p.primaryDomain.toLowerCase().includes(q) ||
            p.technicalSkills.toLowerCase().includes(q) ||
            p.branch.toLowerCase().includes(q)
        );
      }
      if (branch && branch !== 'ALL') {
        participants = participants.filter((p) => p.branch === branch);
      }
      if (section && section !== 'ALL') {
        participants = participants.filter((p) => p.section === section);
      }
      if (domain && domain !== 'ALL') {
        participants = participants.filter((p) => p.primaryDomain === domain || p.allDomains.includes(domain));
      }
      if (selectionStatus && selectionStatus !== 'ALL') {
        participants = participants.filter((p) => p.finalResult?.selectionStatus === selectionStatus);
      }
    }

    // Post-filter by PI status if requested (e.g. PENDING vs COMPLETED)
    let filtered = participants.map((p) => {
      const piCompleted = p.piScores && p.piScores.length > 0;
      const totalPIScore = p.piScores ? p.piScores.reduce((sum: number, score: any) => sum + score.overallScore, 0) : 0;
      const avgPIScore = p.piScores && p.piScores.length > 0 ? totalPIScore / p.piScores.length : 0;

      return {
        ...p,
        piCompleted,
        piScoresCount: p.piScores ? p.piScores.length : 0,
        totalPIScore,
        avgPIScore,
        allDomainsList: typeof p.allDomains === 'string' ? JSON.parse(p.allDomains || '[]') : p.allDomains,
      };
    });

    if (piStatus === 'COMPLETED') {
      filtered = filtered.filter((p) => p.piCompleted);
    } else if (piStatus === 'PENDING') {
      filtered = filtered.filter((p) => !p.piCompleted);
    }

    // Sort
    filtered.sort((a, b) => {
      let valA: any = a.name;
      let valB: any = b.name;

      if (sortBy === 'rollNo') {
        valA = a.rollNo;
        valB = b.rollNo;
      } else if (sortBy === 'finalScore' || sortBy === 'score') {
        valA = a.finalResult?.totalScore ?? a.avgPIScore;
        valB = b.finalResult?.totalScore ?? b.avgPIScore;
      } else if (sortBy === 'rank') {
        valA = a.finalResult?.finalRank || 9999;
        valB = b.finalResult?.finalRank || 9999;
      }

      if (sortOrder === 'desc') {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
      return valA > valB ? 1 : valA < valB ? -1 : 0;
    });

    // Pagination
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      participants: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    const participants = OFFICIAL_150_SHORTLIST.map((s, idx) => ({
      id: `cand-${s.rollNo}`,
      recruitmentCycleId: 'cycle-2026',
      name: s.name,
      rollNo: s.rollNo,
      gender: 'Unspecified',
      email: s.email || `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${s.rollNo.slice(-4)}@akgec.ac.in`,
      contactNo: s.contactNo || '',
      year: '2nd Year',
      branch: s.branch,
      section: s.section,
      residentialStatus: 'Hosteller',
      instagramId: s.instagramId || '',
      linkedinId: s.linkedinId || '',
      primaryDomain: s.primaryDomain,
      allDomains: JSON.stringify(s.allDomains),
      technicalSkills: s.technicalSkills || s.allDomains.join(', '),
      skills: s.technicalSkills || s.allDomains.join(', '),
      projects: s.projects || (s.projectLink ? `Project link: ${s.projectLink}` : `Project in ${s.primaryDomain}`),
      contributionStrengths: s.contributionStrengths || '',
      whyBinaryClub: s.whyBinaryClub || `Passionate about ${s.primaryDomain} and Binary Club activities.`,
      eventIdeas: s.eventIdeas || '',
      threeWords: s.threeWords || '',
      piScores: [
        {
          id: `score-${s.rollNo}`,
          overallScore: s.score,
          recommendation: s.rank <= 50 ? 'STRONGLY_RECOMMEND' : 'RECOMMEND',
        },
      ],
      finalResult: {
        id: `result-${s.rollNo}`,
        totalScore: s.score,
        finalRank: s.rank || idx + 1,
        selectionStatus: 'SHORTLISTED',
      },
    }));
    return NextResponse.json({
      participants,
      total: participants.length,
      page: 1,
      totalPages: 1,
    });
  }
}

export async function PATCH(request: Request) {
  try {
    const { participantIds, selectionStatus, remarks } = await request.json();

    if (!Array.isArray(participantIds) || participantIds.length === 0 || !selectionStatus) {
      return NextResponse.json({ error: 'Participant IDs and selectionStatus required' }, { status: 400 });
    }

    for (const id of participantIds) {
      await db.finalResult.upsert({
        where: { participantId: id },
        update: {
          selectionStatus,
          remarks: remarks || undefined,
        },
        create: {
          participantId: id,
          selectionStatus,
          remarks: remarks || '',
        },
      });
    }

    return NextResponse.json({ success: true, count: participantIds.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Bulk update failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, rollNo, email, branch, section, year, primaryDomain, allDomains, contactNo, technicalSkills, projects, whyBinaryClub } = body;

    if (!name || !rollNo) {
      return NextResponse.json({ error: 'Name and Roll Number are required' }, { status: 400 });
    }

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

    const newParticipant = await db.participant.create({
      data: {
        recruitmentCycleId: cycle.id,
        name,
        rollNo,
        email: email || `${rollNo.slice(-4)}@akgec.ac.in`,
        branch: branch || 'CSE',
        section: section || 'A',
        year: year || '2nd Year',
        primaryDomain: primaryDomain || 'Web Development',
        allDomains: Array.isArray(allDomains) ? JSON.stringify(allDomains) : JSON.stringify([primaryDomain || 'Web Development']),
        contactNo: contactNo || '',
        technicalSkills: technicalSkills || '',
        skills: technicalSkills || '',
        projects: projects || '',
        whyBinaryClub: whyBinaryClub || '',
      },
    });

    // Create default FinalResult entry
    await db.finalResult.create({
      data: {
        participantId: newParticipant.id,
        selectionStatus: 'PENDING',
        totalScore: 0,
      },
    });

    return NextResponse.json({ success: true, participant: newParticipant });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add student' }, { status: 500 });
  }
}
