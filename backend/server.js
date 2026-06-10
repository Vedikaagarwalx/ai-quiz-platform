const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/quiz', require('./src/routes/quiz'));

app.get('/', (req, res) => {
  res.json({ message: 'AI Quiz Platform API chal raha hai!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server port ${PORT} pe chal raha hai`);
});
