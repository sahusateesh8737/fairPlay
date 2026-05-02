const prisma = require('../config/prisma');
const { redisClient, connectRedis } = require('../config/redis');

exports.getAllPracticeProblems = async (req, res, next) => {
  try {
    await connectRedis();
    const cacheKey = 'practice:all';
    
    // Try to get from cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedData),
        fromCache: true
      });
    }

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

    // Save to cache for 1 hour
    await redisClient.set(cacheKey, JSON.stringify(problems), {
      EX: 3600
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
