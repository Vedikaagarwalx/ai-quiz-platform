const generateQuizQuestions = async (topic, difficulty, numQuestions) => {
  
  const mockQuestions = [
    {
      question: `${topic} ke baare mein: Pehla question kya hai?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
      timeLimit: 30,
      points: 100
    },
    {
      question: `${topic} mein sabse important concept kaunsa hai?`,
      options: ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
      correctAnswer: 1,
      timeLimit: 30,
      points: 100
    },
    {
      question: `${topic} ka use kahan hota hai?`,
      options: ["Jagah 1", "Jagah 2", "Jagah 3", "Jagah 4"],
      correctAnswer: 2,
      timeLimit: 30,
      points: 100
    },
    {
      question: `${topic} mein ${difficulty} level ka sawaal?`,
      options: ["Jawab 1", "Jawab 2", "Jawab 3", "Jawab 4"],
      correctAnswer: 3,
      timeLimit: 30,
      points: 150
    },
    {
      question: `${topic} ki history kya hai?`,
      options: ["History 1", "History 2", "History 3", "History 4"],
      correctAnswer: 0,
      timeLimit: 45,
      points: 200
    }
  ];

  return mockQuestions.slice(0, numQuestions);
};

module.exports = { generateQuizQuestions };
