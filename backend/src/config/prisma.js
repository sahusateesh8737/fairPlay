const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
const isAccelerate = databaseUrl && (databaseUrl.startsWith('prisma://') || databaseUrl.startsWith('prisma+postgres://'));

let prisma;

if (isAccelerate) {
  // Use Prisma Accelerate for Prisma 7
  prisma = new PrismaClient({
    accelerateUrl: databaseUrl,
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
} else {
  // Use pg adapter for standard postgres connections
  const pool = new Pool({ 
    connectionString: databaseUrl 
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
}

module.exports = prisma;
