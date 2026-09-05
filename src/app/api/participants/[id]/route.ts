import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const participant = await db.participant.findUnique({
      where: { id },
      include: {
        piScores: {
          include: {
            piRound: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        finalResult: true,
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    return NextResponse.json({
      participant: {
        ...participant,
        allDomainsList: JSON.parse(participant.allDomains || '[]'),
        parsedRawData: JSON.parse(participant.rawFormData || '{}'),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch participant profile' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.participant.update({
      where: { id },
      data: {
        name: body.name,
        rollNo: body.rollNo,
        gender: body.gender,
        email: body.email,
        contactNo: body.contactNo,
        year: body.year,
        branch: body.branch,
        section: body.section,
        residentialStatus: body.residentialStatus,
        instagramId: body.instagramId,
        linkedinId: body.linkedinId,
        primaryDomain: body.primaryDomain,
        allDomains: Array.isArray(body.allDomains) ? JSON.stringify(body.allDomains) : body.allDomains,
        technicalSkills: body.technicalSkills,
        skills: body.skills,
        projects: body.projects,
        technicalExperience: body.technicalExperience,
        achievements: body.achievements,
        contributionStrengths: body.contributionStrengths,
        whyBinaryClub: body.whyBinaryClub,
        eventIdeas: body.eventIdeas,
        threeWords: body.threeWords,
      },
    });

    return NextResponse.json({ success: true, participant: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update participant' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.participant.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete participant' }, { status: 500 });
  }
}
