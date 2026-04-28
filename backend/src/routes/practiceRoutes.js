const express = require('express');
const { getAllPracticeProblems, getPracticeProblem } = require('../controllers/practiceController');

const router = express.Router();

router.get('/', getAllPracticeProblems);
router.get('/:id', getPracticeProblem);

module.exports = router;
