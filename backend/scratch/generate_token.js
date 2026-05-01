const prisma = require('../src/config/prisma');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found in database');
    process.exit(1);
  }
  
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'fairplay_super_secret_key_123',
    { expiresIn: '1d' }
  );
  
  console.log('TOKEN_START');
  console.log(token);
  console.log('TOKEN_END');
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
