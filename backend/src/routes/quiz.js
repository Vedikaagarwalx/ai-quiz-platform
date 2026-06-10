const express = require('express');
const router = express.Router();
const { generateQuiz, getMyQuizzes, getQuizById } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateQuiz);
router.get('/my', protect, getMyQuizzes);
router.get('/:id', protect, getQuizById);

module.exports = router;
