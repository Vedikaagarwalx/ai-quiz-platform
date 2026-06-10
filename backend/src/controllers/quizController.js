const Quiz = require('../models/Quiz');
const { generateQuizQuestions } = require('../services/aiService');

const generateQuiz = async (req, res) => {
  try {
    const { title, topic, difficulty, numQuestions } = req.body;

    const questions = await generateQuizQuestions(
      topic,
      difficulty || 'medium',
      numQuestions || 5
    );

    const quiz = await Quiz.create({
      title,
      topic,
      difficulty: difficulty || 'medium',
      questions,
      createdBy: req.user._id
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz nahi mila' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateQuiz, getMyQuizzes, getQuizById };
