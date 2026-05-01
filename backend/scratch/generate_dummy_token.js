const jwt = require('jsonwebtoken');
require('dotenv').config();

function main() {
  const token = jwt.sign(
    { id: 1, email: 'test@example.com', role: 'student' },
    process.env.JWT_SECRET || 'fairplay_super_secret_key_123',
    { expiresIn: '1d' }
  );
  
  console.log('TOKEN_START');
  console.log(token);
  console.log('TOKEN_END');
  process.exit(0);
}

main();
