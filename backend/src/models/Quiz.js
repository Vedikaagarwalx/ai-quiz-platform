const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: Number, required: true },
  timeLimit: { type: Number, default: 30 },
  points: { type: Number, default: 100 }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);