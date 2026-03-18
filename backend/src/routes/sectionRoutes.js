const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { getAllSections } = require('../controllers/sectionController');

router.use(protect);

router.route('/')
  .get(getAllSections);

module.exports = router;
