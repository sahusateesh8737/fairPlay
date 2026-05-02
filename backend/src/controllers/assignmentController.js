const prisma = require('../config/prisma');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private (Teacher)
exports.createAssignment = async (req, res, next) => {
  try {
    const { title, sectionName, dueDate, questions, description, difficulty, language, maxScore, durationMinutes, referenceImage } = req.body;

    // Resolve section by name
    if (!sectionName) {
      return next(new ErrorResponse('Please provide a target section', 400));
    }

    const normalizedSectionName = sectionName.toUpperCase();

    const section = await prisma.section.findUnique({
      where: { name: normalizedSectionName }
    });

    if (!section) {
      return next(new ErrorResponse(`Section '${normalizedSectionName}' not found`, 404));
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        status: 'active',
        section: { connect: { id: section.id } },
        teacher: { connect: { id: req.user.id } },
        dueDate: dueDate ? new Date(dueDate) : null,
        description,
        difficulty: difficulty || 'Medium',
        language: language || 'JavaScript',
        maxScore: maxScore ? parseInt(maxScore) : 100,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
        referenceImage: referenceImage || null,
        questions: {
          create: questions.map(q => ({
            prompt: q.prompt,
            boilerplate: q.boilerplate || ''
          }))
        }
      },
      include: {
        questions: true,
        section: true
      }
    });

    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all assignments for teacher or section
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res, next) => {
  try {
    // Generate cache key based on role and section
    let cacheKey;
    if (req.user.role === 'teacher') {
      cacheKey = `assignments:teacher:${req.user.id}`;
    } else if (req.user.role === 'student') {
      // Students see assignments for their section
      const sectionId = req.user.sectionId || 'unknown';
      cacheKey = `assignments:student:section:${sectionId}`;
    }

    // Try to get from cache
    if (cacheKey) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.status(200).json({
          success: true,
          data: JSON.parse(cachedData),
          fromCache: true
        });
      }
    }

    let assignments;

    if (req.user.role === 'teacher') {
      assignments = await prisma.assignment.findMany({
        where: { teacherId: req.user.id },
        include: { section: true, _count: { select: { submissions: true } } }
      });
    } else if (req.user.role === 'student') {
      let sectionId = req.user.sectionId;
      if (!sectionId) {
        const userRecord = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { sectionId: true }
        });
        sectionId = userRecord?.sectionId;
      }

      if (!sectionId) {
        return res.status(200).json({ success: true, data: [] });
      }

      assignments = await prisma.assignment.findMany({
        where: { 
          targetSectionId: sectionId,
          status: 'active'
        },
        include: { 
          teacher: { select: { name: true } },
          submissions: {
            where: { studentId: req.user.id },
            select: { id: true, submittedAt: true }
          }
        }
      });
    }

    // Cache the result for 5 minutes
    if (cacheKey && assignments) {
      try {
        await redisClient.set(cacheKey, JSON.stringify(assignments), {
          EX: 300 // 5 minutes
        });
        console.log(`💾 Cache SET for key: ${cacheKey}`);
      } catch (err) {
        console.error('Redis SET error:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (err) {
    next(err);
  }
};
const { redisClient, connectRedis } = require('../config/redis');

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res, next) => {
  try {
    const assignmentId = req.params.id;
    const cacheKey = `assignment:${assignmentId}`;
    
    // Try to get from cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedData),
        fromCache: true
      });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(assignmentId) },
      include: { 
        questions: true,
        teacher: { select: { name: true } },
        submissions: {
          select: {
            id: true,
            studentId: true,
            questionId: true,
            submittedAt: true
          }
        }
      }
    });

    if (!assignment) {
      return next(new ErrorResponse('Assignment not found', 404));
    }

    // Cache for 10 minutes during active exams
    await redisClient.set(cacheKey, JSON.stringify(assignment), {
      EX: 600
    });

    // --- FETCH LIVE PROGRESS FROM REDIS ---
    let liveProgress = {};
    try {
        const progressData = await redisClient.hGetAll(`active_exam:${assignmentId}:progress`);
        Object.keys(progressData).forEach(studentId => {
            liveProgress[studentId] = JSON.parse(progressData[studentId]);
        });
    } catch (err) {
        console.error('Failed to fetch live progress from Redis:', err.message);
    }

    res.status(200).json({
      success: true,
      data: assignment,
      liveProgress // Include the current live states
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Teacher)
exports.deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!assignment) {
      return next(new ErrorResponse('Assignment not found', 404));
    }

    // Check ownership
    if (assignment.teacherId !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete this assignment', 401));
    }

    await prisma.assignment.delete({
      where: { id: parseInt(req.params.id) }
    });

    // Invalidate Cache
    await connectRedis();
    await redisClient.del(`assignment:${req.params.id}`);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update assignment status (activate / close)
// @route   PATCH /api/assignments/:id/status
// @access  Private (Teacher)
exports.updateAssignmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'active' | 'closed' | 'draft'

    if (!['active', 'closed', 'draft'].includes(status)) {
      return next(new ErrorResponse('Invalid status value', 400));
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!assignment) {
      return next(new ErrorResponse('Assignment not found', 404));
    }

    if (assignment.teacherId !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized', 401));
    }

    const updated = await prisma.assignment.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: { section: true }
    });

    // Invalidate Cache
    await connectRedis();
    await redisClient.del(`assignment:${req.params.id}`);

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
