const prisma = require('../config/prisma');

const enforceNetworkSecurity = async (req, res, next) => {
  try {
    // 1. Bypass for Admins & Teachers so they can grade remotedly
    if (req.user && (req.user.role === 'admin' || req.user.role === 'teacher')) {
      return next();
    }

    // 2. Check Emergency Override mechanism
    const overrideConfig = await prisma.systemConfig.findUnique({
      where: { key: 'EMERGENCY_OVERRIDE' }
    });

    if (overrideConfig && overrideConfig.value === 'true') {
      return next(); // Bypass security checks during network outage
    }

    // 3. Robust client IP extraction
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    
    if (clientIp && typeof clientIp === 'string') {
        // x-forwarded-for can be a comma-separated list, grab the original client
        clientIp = clientIp.split(',')[0].trim(); 
        
        // Clean up IPv6-wrapped IPv4 addresses
        if (clientIp.startsWith('::ffff:')) {
            clientIp = clientIp.replace('::ffff:', '');
        }
    }

    if (!clientIp) {
      return res.status(403).json({
        success: false,
        message: 'Network Access Denied: Could not resolve client IP address.'
      });
    }

    // 4. Database Whitelist Lookup
    const isAllowed = await prisma.allowedIp.findUnique({
      where: { ipAddress: clientIp }
    });

    if (!isAllowed) {
      return res.status(403).json({
         success: false,
         message: `Network Access Denied: Your IP (${clientIp}) is not authorized. Please connect to the official campus network.`
      });
    }

    // 5. IP verified successfully
    next();
  } catch (err) {
    console.error("Network Security Middleware Error:", err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error during network validation.' 
    });
  }
};

module.exports = { enforceNetworkSecurity };
