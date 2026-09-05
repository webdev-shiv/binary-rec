import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial Binary Club recruitment data...');

  // Create default Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@binaryclub.com' },
    update: {},
    create: {
      name: 'Binary Club Admin',
      email: 'admin@binaryclub.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log('Admin user ready:', adminUser.email);

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
    console.log('Created recruitment cycle:', cycle.name);
  }

  // Create default PI Round 1 if none exists
  const existingRounds = await prisma.pIRound.count({
    where: { recruitmentCycleId: cycle.id },
  });

  if (existingRounds === 0) {
    await prisma.pIRound.create({
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
    console.log('Created default PI Round 1');
  }

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
