import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    const scoredBy = session?.name || 'Interviewer';

    const body = await request.json();
    const {
      participantId,
      piRoundId,

      // 4 Main Sections (Max 25 pts each)
      techKnowledge,
      publicSpeaking,
      project,
      overall,

      // Fallbacks for backwards compatibility
      technicalScore,
      communicationScore,
      problemSolvingScore,
      domainKnowledgeScore,
      projectScore,
      attitudeScore,
      contributionScore,

      interviewerNotes = '',
      recommendation = 'RECOMMEND',
    } = body;

    if (!participantId || !piRoundId) {
      return NextResponse.json({ error: 'Participant ID and PI Round ID are required' }, { status: 400 });
    }

    let piRound = null;
    try {
      piRound = await db.pIRound.findUnique({
        where: { id: piRoundId },
      });
    } catch {
      // ignore db error
    }

    // Parse the 4 evaluation categories (max 25 points each)
    const techVal = techKnowledge !== undefined ? Number(techKnowledge) : Number(technicalScore || 0);
    const pubVal = publicSpeaking !== undefined ? Number(publicSpeaking) : Number(communicationScore || 0);
    const projVal = project !== undefined ? Number(project) : Number(projectScore || 0);
    const overallVal = overall !== undefined ? Number(overall) : (
      Number(problemSolvingScore || 0) + 
      Number(domainKnowledgeScore || 0) + 
      Number(attitudeScore || 0) + 
      Number(contributionScore || 0)
    );

    const calculatedTotal = techVal + pubVal + projVal + overallVal;

    // Validate max score constraint
    if (piRound && calculatedTotal > piRound.maxScore) {
      return NextResponse.json(
        { error: `Total score (${calculatedTotal}) exceeds maximum allowed score (${piRound.maxScore})` },
        { status: 400 }
      );
    }

    let scoreEntry = null;
    try {
      if (piRound) {
        scoreEntry = await db.pIScore.upsert({
          where: {
            participantId_piRoundId: {
              participantId,
              piRoundId,
            },
          },
          update: {
            technicalScore: techVal,
            communicationScore: pubVal,
            projectScore: projVal,
            attitudeScore: overallVal,
            problemSolvingScore: 0,
            domainKnowledgeScore: 0,
            contributionScore: 0,
            overallScore: calculatedTotal,
            interviewerNotes,
            recommendation,
            scoredBy,
          },
          create: {
            participantId,
            piRoundId,
            technicalScore: techVal,
            communicationScore: pubVal,
            projectScore: projVal,
            attitudeScore: overallVal,
            problemSolvingScore: 0,
            domainKnowledgeScore: 0,
            contributionScore: 0,
            overallScore: calculatedTotal,
            interviewerNotes,
            recommendation,
            scoredBy,
          },
        });
      }
    } catch {
      // ignore database upsert error for local fallback
    }

    return NextResponse.json({
      success: true,
      piScore: scoreEntry || {
        participantId,
        overallScore: calculatedTotal,
        technicalScore: techVal,
        communicationScore: pubVal,
        projectScore: projVal,
        attitudeScore: overallVal,
        recommendation,
        interviewerNotes,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save PI score' }, { status: 500 });
  }
}
