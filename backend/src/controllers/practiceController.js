const prisma = require('../config/prisma');

exports.getAllPracticeProblems = async (req, res, next) => {
  try {
    const problems = await prisma.practiceProblem.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        createdAt: true
      },
      orderBy: { id: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: problems
    });
  } catch (err) {
    next(err);
  }
};

exports.getPracticeProblem = async (req, res, next) => {
  try {
    const problem = await prisma.practiceProblem.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }

    res.status(200).json({
      success: true,
      data: problem
    });
  } catch (err) {
    next(err);
  }
};
