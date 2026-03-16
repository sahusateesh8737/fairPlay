const prisma = require('../config/prisma');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private (Teacher)
exports.createAssignment = async (req, res, next) => {
  try {
    const { title, sectionName, dueDate, questions } = req.body;

    // Resolve section by name
    if (!sectionName) {
      return next(new ErrorResponse('Please provide a target section', 400));
    }

    const section = await prisma.section.findUnique({
      where: { name: sectionName }
    });

    if (!section) {
      return next(new ErrorResponse(`Section '${sectionName}' not found`, 404));
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        status: 'active',
        section: { connect: { id: section.id } },
        teacher: { connect: { id: req.user.id } },
        dueDate: dueDate ? new Date(dueDate) : null,
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
    let assignments;

    if (req.user.role === 'teacher') {
      assignments = await prisma.assignment.findMany({
        where: { teacherId: req.user.id },
        include: { section: true, _count: { select: { submissions: true } } }
      });
    } else if (req.user.role === 'student') {
      // sectionId may be in the JWT, but fall back to DB lookup for old tokens
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
        include: { teacher: { select: { name: true } } }
      });
    }

    res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (err) {
    next(err);
  }
};
// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res, next) => {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { 
        questions: true,
        teacher: { select: { name: true } }
      }
    });

    if (!assignment) {
      return next(new ErrorResponse('Assignment not found', 404));
    }

    res.status(200).json({
      success: true,
      data: assignment
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

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
