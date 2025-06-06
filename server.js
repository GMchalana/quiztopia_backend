require('dotenv').config();
const express = require('express');
const app = express();
const heathRoutes = require('./routes/healthRoutes')
const cors = require('cors');
const  db = require('./startup/database');
const authRoutes = require('./routes/Auth');
const modulesRoutes = require('./routes/Ins-modules');
const stAnswersRoutes = require('./routes/StAnswers');
const reviewIns = require('./routes/AnswerReview');

const bodyParser = require('body-parser');
// const users = require('./users');

app.use(express.json());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlenc

// app.use('/api', users);
app.use(cors({
  origin:'*'
})); // Enable CORS for all routes


db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database in index.js :', err);
    return;
  }
  console.log('Connected to the MySQL database in server.js (admin).  ✅  ');
  connection.release();
});


app.use("", heathRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/answers', stAnswersRoutes);
app.use('/api/review', reviewIns);

app.get('/test', (req, res) => {
  res.send('Test route is working!');
  console.log('test route is working');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
