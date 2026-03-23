const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, sectionName, teacherSecret } = req.body;

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return next(new ErrorResponse('User already exists', 400));
    }

    // Role-specific validation
    let resolvedSectionId = null;
    if (role === 'teacher') {
      if (teacherSecret !== process.env.TEACHER_SECRET) {
        return next(new ErrorResponse('Invalid teacher access code', 401));
      }
    } else if (role === 'student') {
      if (!sectionName) {
        return next(new ErrorResponse('Please select a section', 400));
      }
      
      // Look up or create section by name
      const normalizedSectionName = sectionName.toUpperCase();
      let section = await prisma.section.findUnique({
        where: { name: normalizedSectionName }
      });

      // For dev/testing: auto-create section if it doesn't exist
      if (!section) {
        section = await prisma.section.create({
          data: { name: normalizedSectionName }
        });
      }
      resolvedSectionId = section.id;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        sectionId: resolvedSectionId
      }
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return next(new ErrorResponse('Incorrect email or password', 401));
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new ErrorResponse('Incorrect email or password', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { section: true }
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name, sectionId: user.sectionId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      sectionId: user.sectionId,
      registrationNumber: user.registrationNumber,
      department: user.department,
      semester: user.semester,
      year: user.year,
      rollNumber: user.rollNumber
    }
  });
};

// @desc    Update user profile (academic details)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { registrationNumber, department, semester, year, rollNumber } = req.body;

    // Check if registration number is already taken by another user
    if (registrationNumber) {
      const existingUser = await prisma.user.findFirst({
        where: {
          registrationNumber,
          NOT: { id: req.user.id }
        }
      });

      if (existingUser) {
        return next(new ErrorResponse('Registration number is already in use', 400));
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        registrationNumber,
        department,
        semester: semester ? parseInt(semester) : null,
        year: year ? parseInt(year) : null,
        rollNumber
      },
      include: { section: true }
    });

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Get all sections
// @route   GET /api/auth/sections
// @access  Private (Teacher/Admin)
exports.getSections = async (req, res, next) => {
  try {
    const sections = await prisma.section.findMany();
    res.status(200).json({
      success: true,
      data: sections
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get students by section
// @route   GET /api/auth/students
// @access  Private (Teacher/Admin)
exports.getStudentsBySection = async (req, res, next) => {
  try {
    const { sectionName } = req.query;

    const query = {
      where: { role: 'student' },
      include: { section: true },
      orderBy: { name: 'asc' }
    };

    if (sectionName && sectionName !== 'all') {
      query.where.section = { name: sectionName };
    }

    const students = await prisma.user.findMany(query);

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (err) {
    next(err);
  }
};

