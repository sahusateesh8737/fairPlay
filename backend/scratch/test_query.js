const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const submissions = await prisma.submission.findMany({
    include: { cheatLogs: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log("Latest 5 Submissions:");
  submissions.forEach(sub => {
    console.log(`Sub ID: ${sub.id}, Student ID: ${sub.studentId}, Logs Count: ${sub.cheatLogs.length}`);
    if (sub.cheatLogs.length > 0) {
      console.log(`  Log 1: ${sub.cheatLogs[0].eventType} at ${sub.cheatLogs[0].eventTimestamp}`);
    }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
