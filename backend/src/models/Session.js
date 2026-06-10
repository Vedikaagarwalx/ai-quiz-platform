const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: String,
  socketId: String,
  score: { type: Number, default: 0 },
  answers: [{
    questionIndex: Number,
    answer: Number,
    correct: Boolean,
    timeTaken: Number
  }]
});

const sessionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roomCode: { type: String, unique: true },
  players: [playerSchema],
  status: {
    type: String,
    enum: ['waiting', 'active', 'finished'],
    default: 'waiting'
  },
  currentQuestion: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);