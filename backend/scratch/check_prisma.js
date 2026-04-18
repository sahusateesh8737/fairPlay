const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const assignment = await prisma.assignment.findFirst();
    console.log("Found assignment:", assignment);
    console.log("durationMinutes field:", assignment ? assignment.durationMinutes : "N/A");
    
    const session = await prisma.examSession.findFirst();
    console.log("Found session:", session);
    
    process.exit(0);
  } catch (err) {
    console.error("Prisma Check Error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

check();
