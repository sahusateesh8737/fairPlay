const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const assignments = await prisma.assignment.findMany({
      select: { id: true, title: true, durationMinutes: true }
    });
    console.log("Assignments Table Summary:");
    assignments.forEach(a => {
      console.log(`ID: ${a.id} | Title: ${a.title} | Duration: ${a.durationMinutes} min`);
    });
    
    const sessions = await prisma.examSession.findMany({
        include: { assignment: true, student: true }
    });
    console.log("\nActive Exam Sessions:");
    sessions.forEach(s => {
        console.log(`Student: ${s.student.name} | Assignment: ${s.assignment.title} | Started: ${s.startedAt}`);
    });
    
  } catch (err) {
    console.error("Prisma Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
