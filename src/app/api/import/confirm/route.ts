import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { candidates, filename = 'recruitment_responses.pdf' } = await request.json();

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json({ error: 'No candidates provided for import' }, { status: 400 });
    }

    // Get active cycle
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

    let insertedCount = 0;
    let updatedCount = 0;

    for (const c of candidates) {
      const rollNo = c.rollNo || `ROLL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const participantData = {
        name: c.name || 'Unnamed Participant',
        gender: c.gender || 'Unspecified',
        email: c.email || `${rollNo.toLowerCase()}@binaryclub.org`,
        contactNo: c.contactNo || '',
        year: c.year || '1st Year',
        branch: c.branch || 'CSE',
        section: c.section || 'A',
        residentialStatus: c.residentialStatus || 'Hosteller',
        instagramId: c.instagramId || null,
        linkedinId: c.linkedinId || null,
        primaryDomain: c.primaryDomain || 'Web Development',
        allDomains: JSON.stringify(c.allDomains || [c.primaryDomain || 'Web Development']),
        technicalSkills: c.technicalSkills || '',
        skills: c.skills || c.technicalSkills || '',
        projects: c.projects || '',
        technicalExperience: c.technicalExperience || '',
        achievements: c.achievements || '',
        contributionStrengths: c.contributionStrengths || '',
        whyBinaryClub: c.whyBinaryClub || '',
        eventIdeas: c.eventIdeas || '',
        threeWords: c.threeWords || '',
        rawFormData: JSON.stringify(c.rawFormData || {}),
      };

      const existing = await db.participant.findUnique({
        where: {
          recruitmentCycleId_rollNo: {
            recruitmentCycleId: cycle.id,
            rollNo,
          },
        },
      });

      if (existing) {
        await db.participant.update({
          where: { id: existing.id },
          data: participantData,
        });
        updatedCount++;
      } else {
        const newParticipant = await db.participant.create({
          data: {
            recruitmentCycleId: cycle.id,
            rollNo,
            ...participantData,
          },
        });

        // Initialize FinalResult entry
        await db.finalResult.create({
          data: {
            participantId: newParticipant.id,
            selectionStatus: 'PENDING',
          },
        });

        insertedCount++;
      }
    }

    // Save document import record
    await db.documentImport.create({
      data: {
        recruitmentCycleId: cycle.id,
        filename,
        fileType: 'PDF',
        candidateCount: candidates.length,
        importStatus: 'COMPLETED',
      },
    });

    return NextResponse.json({
      success: true,
      insertedCount,
      updatedCount,
      totalProcessed: candidates.length,
    });
  } catch (error: any) {
    console.error('Import confirm error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save candidates to database' }, { status: 500 });
  }
}
