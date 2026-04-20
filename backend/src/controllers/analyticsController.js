const prisma = require('../config/prisma');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get analytics for a specific assignment
// @route   GET /api/analytics/assignment/:id
// @access  Private (Teacher/Admin)
exports.getAssignmentAnalytics = async (req, res, next) => {
  try {
    const assignmentId = parseInt(req.params.id);

    // 1. Fetch assignment and its max score
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { maxScore: true, title: true }
    });

    if (!assignment) {
      return next(new ErrorResponse('Assignment not found', 404));
    }

    // 2. Fetch all submissions for this assignment
    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      select: {
        score: true,
        cheatLogs: {
          select: { eventType: true }
        }
      }
    });

    // 3. Calculate Score Distribution (Histogram)
    // Intervals: 0-20%, 21-40%, 41-60%, 61-80%, 81-100%
    const maxScore = assignment.maxScore || 100;
    const distribution = [
      { range: '0-20%', count: 0 },
      { range: '21-40%', count: 0 },
      { range: '41-60%', count: 0 },
      { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 }
    ];

    submissions.forEach(sub => {
      if (sub.score === null) return;
      const percentage = (Number(sub.score) / maxScore) * 100;
      if (percentage <= 20) distribution[0].count++;
      else if (percentage <= 40) distribution[1].count++;
      else if (percentage <= 60) distribution[2].count++;
      else if (percentage <= 80) distribution[3].count++;
      else distribution[4].count++;
    });

    // 4. Calculate Integrity Breakdown (Violation Pie Chart)
    const integrityMap = {};
    submissions.forEach(sub => {
      sub.cheatLogs.forEach(log => {
        integrityMap[log.eventType] = (integrityMap[log.eventType] || 0) + 1;
      });
    });

    const integrityData = Object.keys(integrityMap).map(type => ({
      name: type,
      value: integrityMap[type]
    }));

    res.status(200).json({
      success: true,
      data: {
        assignmentTitle: assignment.title,
        totalSubmissions: submissions.length,
        distribution,
        integrityData
      }
    });
  } catch (err) {
    next(err);
  }
};
