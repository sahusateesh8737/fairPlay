const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

// ==========================================
// 1. NETWORK & SECURITY MANAGEMENT
// ==========================================

// Get all allowed IPs
exports.getAllowedIps = async (req, res, next) => {
  try {
    const ips = await prisma.allowedIp.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: ips });
  } catch (err) {
    next(err);
  }
};

// Add new allowed IP
exports.addAllowedIp = async (req, res, next) => {
  try {
    const { ipAddress, description } = req.body;
    
    // Basic validation
    if (!ipAddress) return res.status(400).json({ success: false, message: 'IP Address is required' });

    const newIp = await prisma.allowedIp.create({
      data: {
        ipAddress,
        description,
        addedBy: req.user.id
      }
    });

    res.status(201).json({ success: true, data: newIp });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'IP Address already exists in whitelist' });
    }
    next(err);
  }
};

// Remove allowed IP
exports.removeAllowedIp = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.allowedIp.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ success: true, message: 'IP removed successfully' });
  } catch (err) {
    next(err);
  }
};

// Get Global Config (Emergency Override)
exports.getGlobalConfig = async (req, res, next) => {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { key: 'EMERGENCY_OVERRIDE' } });
    res.status(200).json({ success: true, data: { emergencyOverride: config?.value === 'true' } });
  } catch (err) {
    next(err);
  }
};

// Set Global Config (Emergency Override)
exports.setGlobalConfig = async (req, res, next) => {
  try {
    const { emergencyOverride } = req.body;
    
    const config = await prisma.systemConfig.upsert({
      where: { key: 'EMERGENCY_OVERRIDE' },
      update: { value: emergencyOverride ? 'true' : 'false' },
      create: { key: 'EMERGENCY_OVERRIDE', value: emergencyOverride ? 'true' : 'false' }
    });

    res.status(200).json({ success: true, data: { emergencyOverride: config.value === 'true' } });
  } catch (err) {
    next(err);
  }
};


// ==========================================
// 2. USER & ACCESS CONTROL
// ==========================================

// Get all users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, sectionId: true, createdAt: true,
        section: { select: { id: true, name: true } }
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// Admin manually creates a teacher
exports.createTeacher = async (req, res, next) => {
  try {
    const { name, email, password, sectionId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password required' });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const data = {
      name, email, password: hashedPassword, role: 'teacher'
    };
    if (sectionId) data.sectionId = parseInt(sectionId);

    const teacher = await prisma.user.create({
      data,
      select: { id: true, name: true, email: true, role: true }
    });

    res.status(201).json({ success: true, data: teacher });
  } catch (err) {
    next(err);
  }
};

// Delete or 'Suspend' a user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (parseInt(id) === req.user.id) {
       return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
    }

    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

// Change a user's assigned section
exports.updateUserSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sectionId } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { sectionId: sectionId ? parseInt(sectionId) : null },
      select: { id: true, name: true, section: { select: { name: true } } }
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};


// ==========================================
// 3. ACADEMIC STRUCTURE (SECTIONS)
// ==========================================

exports.createSection = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Section name required' });

    const section = await prisma.section.create({ data: { name } });
    res.status(201).json({ success: true, data: section });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Section already exists' });
    }
    next(err);
  }
};


// ==========================================
// 4. SYSTEM AUDIT & ANALYTICS
// ==========================================

exports.getGlobalCheatLogs = async (req, res, next) => {
  try {
    const logs = await prisma.cheatLog.findMany({
      include: {
        submission: {
          include: {
            student: { select: { name: true, email: true, section: { select: { name: true } } } },
            assignment: { select: { title: true } }
          }
        }
      },
      orderBy: { eventTimestamp: 'desc' },
      take: 100 // Limit for performance
    });
    
    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};

exports.getPlatformMetrics = async (req, res, next) => {
  try {
    const [studentCount, teacherCount, assignmentCount, submissionCount, activeCheatLogs] = await Promise.all([
      prisma.user.count({ where: { role: 'student' } }),
      prisma.user.count({ where: { role: 'teacher' } }),
      prisma.assignment.count(),
      prisma.submission.count(),
      prisma.cheatLog.count()
    ]);

    res.status(200).json({ 
      success: true, 
      data: {
        studentCount,
        teacherCount,
        assignmentCount,
        submissionCount,
        activeCheatLogs
      }
    });
  } catch (err) {
    next(err);
  }
};
