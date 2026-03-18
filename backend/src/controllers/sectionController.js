const prisma = require('../config/prisma');

exports.getAllSections = async (req, res, next) => {
  try {
    const sections = await prisma.section.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      count: sections.length,
      data: sections
    });
  } catch (error) {
    next(error);
  }
};
