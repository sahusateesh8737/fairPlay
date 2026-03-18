const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');

const {
  getAllowedIps,
  addAllowedIp,
  removeAllowedIp,
  getGlobalConfig,
  setGlobalConfig,
  getUsers,
  createTeacher,
  deleteUser,
  updateUserSection,
  createSection,
  getGlobalCheatLogs,
  getPlatformMetrics
} = require('../controllers/adminController');

// All admin routes are protected and restricted to 'admin' role
router.use(protect, authorize('admin'));

// 1. Network & Security
router.get('/ips', getAllowedIps);
router.post('/ips', addAllowedIp);
router.delete('/ips/:id', removeAllowedIp);

router.get('/config/override', getGlobalConfig);
router.post('/config/override', setGlobalConfig);

// 2. User & Access Control
router.get('/users', getUsers);
router.post('/users/teacher', createTeacher);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/section', updateUserSection);

// 3. Academic Structure
// Note: Getting all sections is handled by the general `sectionRoutes.js`
router.post('/sections', createSection);

// 4. Analytics
router.get('/analytics/logs', getGlobalCheatLogs);
router.get('/analytics/metrics', getPlatformMetrics);

module.exports = router;
