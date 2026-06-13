const Session = require('../models/Session');

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const calculatePoints = (basePoints, timeTaken, timeLimit) => {
  const timeBonus = Math.floor((1 - timeTaken / timeLimit) * basePoints * 0.5);
  return basePoints + Math.max(0, timeBonus);
};

module.exports = (io) => {
  const rooms = {};

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('create_room', async ({ quizId, hostName }) => {
      try {
        const Quiz = require('../models/Quiz');
        const quiz = await Quiz.findById(quizId);
        if (!quiz) { socket.emit('error', { message: 'Quiz nahi mila' }); return; }

        const roomCode = generateRoomCode();
        const session = await Session.create({
          quiz: quizId, roomCode, players: [], status: 'waiting', currentQuestion: 0
        });

        rooms[roomCode] = {
          sessionId: session._id, quizId,
          hostSocketId: socket.id, hostName,
          players: {}, currentQuestion: -1,
          status: 'waiting', quiz
        };

        socket.join(roomCode);
        socket.emit('room_created', {
          roomCode, sessionId: session._id,
          quizTitle: quiz.title,
          totalQuestions: quiz.questions.length
        });
        console.log(`Room created: ${roomCode}`);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('join_room', ({ roomCode, playerName }) => {
      const code = roomCode.toUpperCase();
      const room = rooms[code];

      if (!room) { socket.emit('error', { message: 'Room nahi mila!' }); return; }
      if (room.status === 'active') { socket.emit('error', { message: 'Quiz chal raha hai' }); return; }

      room.players[socket.id] = { name: playerName, socketId: socket.id, score: 0, answers: [] };
      socket.join(code);

      socket.emit('joined_room', { roomCode: code, playerName, quizTitle: room.quiz.title });

      const players = Object.values(room.players).map(p => ({ name: p.name, score: p.score }));
      io.to(code).emit('player_joined', { playerName, playerCount: players.length, players });
      console.log(`${playerName} joined ${code}`);
    });

    socket.on('start_quiz', ({ roomCode }) => {
      const room = rooms[roomCode];
      if (!room || room.hostSocketId !== socket.id) return;
      room.status = 'active';
      room.currentQuestion = 0;
      sendQuestion(io, room, roomCode);
    });

    socket.on('submit_answer', ({ roomCode, answerIndex, timeTaken }) => {
      const room = rooms[roomCode];
      if (!room || room.status !== 'active') return;
      const player = room.players[socket.id];
      if (!player) return;

      const currentQ = room.quiz.questions[room.currentQuestion];
      if (player.answers[room.currentQuestion] !== undefined) return;

      const isCorrect = answerIndex === currentQ.correctAnswer;
      const points = isCorrect ? calculatePoints(currentQ.points, timeTaken, currentQ.timeLimit) : 0;

      player.score += points;
      player.answers[room.currentQuestion] = { answer: answerIndex, correct: isCorrect, points, timeTaken };

      socket.emit('answer_result', {
        correct: isCorrect, points,
        totalScore: player.score,
        correctAnswer: currentQ.correctAnswer
      });

      const total = Object.keys(room.players).length;
      const answered = Object.values(room.players).filter(p => p.answers[room.currentQuestion] !== undefined).length;
      if (answered === total) showLeaderboard(io, room, roomCode);
    });

    socket.on('next_question', ({ roomCode }) => {
      const room = rooms[roomCode];
      if (!room || room.hostSocketId !== socket.id) return;
      room.currentQuestion++;
      if (room.currentQuestion >= room.quiz.questions.length) {
        endQuiz(io, room, roomCode);
      } else {
        sendQuestion(io, room, roomCode);
      }
    });

    socket.on('disconnect', () => {
      for (const roomCode in rooms) {
        const room = rooms[roomCode];
        if (room.hostSocketId === socket.id) {
          io.to(roomCode).emit('host_disconnected', { message: 'Host disconnect ho gaya' });
          delete rooms[roomCode];
        }
        if (room && room.players[socket.id]) {
          const playerName = room.players[socket.id].name;
          delete room.players[socket.id];
          io.to(roomCode).emit('player_left', { playerName });
        }
      }
    });
  });

  const sendQuestion = (io, room, roomCode) => {
    const q = room.quiz.questions[room.currentQuestion];
    io.to(roomCode).emit('new_question', {
      questionIndex: room.currentQuestion,
      totalQuestions: room.quiz.questions.length,
      question: q.question, options: q.options,
      timeLimit: q.timeLimit, points: q.points
    });
  };

  const showLeaderboard = (io, room, roomCode) => {
    const leaderboard = Object.values(room.players)
      .sort((a, b) => b.score - a.score)
      .map((p, i) => ({ rank: i + 1, name: p.name, score: p.score }));

    io.to(roomCode).emit('show_leaderboard', {
      leaderboard,
      questionIndex: room.currentQuestion,
      isLastQuestion: room.currentQuestion === room.quiz.questions.length - 1
    });
  };

  const endQuiz = async (io, room, roomCode) => {
    const finalLeaderboard = Object.values(room.players)
      .sort((a, b) => b.score - a.score)
      .map((p, i) => ({ rank: i + 1, name: p.name, score: p.score }));

    io.to(roomCode).emit('quiz_ended', { finalLeaderboard, winner: finalLeaderboard[0] });

    try {
      await Session.findByIdAndUpdate(room.sessionId, {
        status: 'finished',
        players: Object.values(room.players).map(p => ({
          name: p.name, socketId: p.socketId, score: p.score, answers: p.answers
        }))
      });
    } catch (err) { console.error(err); }
  };
};