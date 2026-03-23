
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { role: 'student' }, select: { id: true, name: true, sectionId: true } });
  const assignments = await prisma.assignment.findMany({ select: { id: true, title: true, targetSectionId: true, status: true } });
  console.log('STUDENTS:', users);
  console.log('ASSIGNMENTS:', assignments);
}

main().catch(console.error).finally(() => prisma.$disconnect());

