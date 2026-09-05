import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { OFFICIAL_150_SHORTLIST } from '../src/lib/students150';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data and seeding ONLY the official 150 shortlisted students with rich details...');

  // Delete existing records to ensure ONLY the 150 candidates exist
  await prisma.pIScore.deleteMany({});
  await prisma.finalResult.deleteMany({});
  await prisma.participant.deleteMany({});
  await prisma.documentImport.deleteMany({});

  // Create official BINARYCLUB Admin User
  const binaryClubPasswordHash = await bcrypt.hash('B1N@RY0101', 10);
  const binaryClubUser = await prisma.user.upsert({
    where: { email: 'binaryclub@binaryclub.org' },
    update: { passwordHash: binaryClubPasswordHash },
    create: {
      name: 'BINARYCLUB',
      email: 'binaryclub@binaryclub.org',
      passwordHash: binaryClubPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log('BINARYCLUB Admin user ready:', binaryClubUser.name);

  // Create default Interviewer User
  const interviewerPasswordHash = await bcrypt.hash('interviewer123', 10);
  await prisma.user.upsert({
    where: { email: 'interviewer@binaryclub.com' },
    update: {},
    create: {
      name: 'Lead Technical Interviewer',
      email: 'interviewer@binaryclub.com',
      passwordHash: interviewerPasswordHash,
      role: 'INTERVIEWER',
    },
  });

  // Create default Recruitment Cycle
  let cycle = await prisma.recruitmentCycle.findFirst({
    where: { status: 'ACTIVE' },
  });

  if (!cycle) {
    cycle = await prisma.recruitmentCycle.create({
      data: {
        name: 'Binary Club Core Recruitment 2026',
        year: 2026,
        status: 'ACTIVE',
      },
    });
  }

  // Create default PI Round 1
  let piRound = await prisma.pIRound.findFirst({
    where: { recruitmentCycleId: cycle.id },
  });

  if (!piRound) {
    piRound = await prisma.pIRound.create({
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

  // Seed EXACTLY the 150 shortlisted candidates
  console.log(`Seeding EXACTLY ${OFFICIAL_150_SHORTLIST.length} official candidates with response form details...`);
  
  for (const s of OFFICIAL_150_SHORTLIST) {
    const email = s.email || `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${s.rollNo.slice(-4)}@binaryclub.org`;
    
    const p = await prisma.participant.create({
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

    await prisma.finalResult.create({
      data: {
        participantId: p.id,
        totalScore: s.score,
        finalRank: s.rank,
        applicationScore: Math.round(s.score * 0.4),
        selectionStatus: 'SHORTLISTED',
      },
    });

    await prisma.pIScore.create({
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

  console.log(`Successfully seeded ONLY the 150 official candidates with rich response form data!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
