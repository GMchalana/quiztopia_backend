const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const healthRoutes = require('../routes/healthRoutes');
const authRoutes = require('../routes/Auth');
const modulesRoutes = require('../routes/Ins-modules');
const stAnswersRoutes = require('../routes/StAnswers');
const reviewIns = require('../routes/AnswerReview');

const app = express();

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// DB connection (optional - ensure MySQL works serverlessly)
const db = require('../startup/database');
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database ✅');
  connection.release();
});

// Routes
app.use("", healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/answers', stAnswersRoutes);
app.use('/api/review', reviewIns);

app.get('/test', (req, res) => {
  res.send('Test route is working!');
});

module.exports = serverless(app);
