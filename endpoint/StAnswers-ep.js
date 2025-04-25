// controllers/moduleController.js
const moduleDAO = require('../dao/StAnswers-dao');
const db = require("../startup/database");

exports.submitAnswers = async (req, res) => {
  try {
    const { userId, moduleId, answers } = req.body;

    if (!userId || !moduleId || !answers) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await moduleDAO.saveStudentAnswersWithAttempt(userId, moduleId, answers);

    res.status(200).json({ message: 'Answers submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};











exports.saveManualAnswers = async (req, res) => {
  const { moduleId, answers, userId } = req.body;
  let connection;
  
  try {
    // Get a connection from the pool
    connection = await db.promise().getConnection();
    await connection.beginTransaction();
    
    try {
      // Get the latest attempt number for this user and module
      const [attemptResults] = await connection.query(
        `SELECT MAX(userAttemptNumber) as lastAttempt 
         FROM quizattempt 
         WHERE userId = ? AND moduleId = ?`,
        [userId, moduleId]
      );
      
      const userAttemptNumber = (attemptResults[0]?.lastAttempt || 0) + 1;
      
      // Create a new quiz attempt
      const [attemptResult] = await connection.query(
        `INSERT INTO quizattempt (userId, moduleId, userAttemptNumber) 
         VALUES (?, ?, ?)`,
        [userId, moduleId, userAttemptNumber]
      );
      
      const attemptId = attemptResult.insertId;
      
      // Insert each answer
      const insertPromises = Object.entries(answers).map(([questionId, answer]) => {
        return connection.query(
          `INSERT INTO manual_answers 
           (userId, moduleId, questionId, attemptId, answer) 
           VALUES (?, ?, ?, ?, ?)`,
          [userId, moduleId, questionId, attemptId, answer]
        );
      });
      
      await Promise.all(insertPromises);
      
      // Commit the transaction
      await connection.commit();
      
      res.status(201).json({
        success: true,
        message: 'Manual answers submitted successfully',
        attemptId,
        userAttemptNumber
      });
      
    } catch (error) {
      // If anything fails, roll back the transaction
      await connection.rollback();
      throw error;
    } finally {
      // Always release the connection back to the pool
      if (connection) connection.release();
    }
  } catch (error) {
    console.error('Error saving manual answers:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save manual answers ❌' 
    });
  }
};




exports.getAttemptDetails = async (req, res) => {
  const { attemptId } = req.params;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  try {
    // First, get the attempt information to identify the module and user
    const [attemptInfo] = await db.promise().query(
      `SELECT userId, moduleId, userAttemptNumber 
       FROM quizattempt 
       WHERE id = ?`,
      [attemptId]
    );
    
    if (!attemptInfo || attemptInfo.length === 0) {
      return res.status(404).json({ success: false, error: 'Attempt not found' });
    }
    
    const { userId, moduleId } = attemptInfo[0];
    
    // Get module information to determine if it's manual or auto
    const [moduleInfo] = await db.promise().query(
      `SELECT manualOrAuto FROM module WHERE id = ?`,
      [moduleId]
    );
    
    if (!moduleInfo || moduleInfo.length === 0) {
      return res.status(404).json({ success: false, error: 'Module not found' });
    }
    
    const isManual = moduleInfo[0].manualOrAuto === 'manual';
    
    let questions = [];
    let studentAnswers = [];
    
    if (isManual) {
      // Get all manual graded questions for this module
      [questions] = await db.promise().query(
        `SELECT id, questionIndex, question, sampleAnswer 
         FROM manualgradedquestions 
         WHERE moduleId = ? 
         ORDER BY questionIndex`,
        [moduleId]
      );
      
      // Get student's manual answers for this attempt
      [studentAnswers] = await db.promise().query(
        `SELECT questionId, answer, trueOrFalse 
         FROM manual_answers 
         WHERE attemptId = ?`,
        [attemptId]
      );
    } else {
      // For auto-graded questions, get both MC and TF questions
      // Get multiple choice questions
      const [mcQuestions] = await db.promise().query(
        `SELECT 
          mc.id, 
          mc.questionIndex, 
          mc.questionName AS question, 
          'multiple-choice' AS type,
          JSON_ARRAYAGG(JSON_OBJECT('id', a.id, 'answer', a.answer, 'trueOrFalse', a.trueOrFalse)) AS options
        FROM mcquestions mc
        JOIN mcqanswers a ON mc.id = a.mcqId
        WHERE mc.moduleId = ?
        GROUP BY mc.id
        ORDER BY mc.questionIndex`,
        [moduleId]
      );
      
      // Get true/false questions (assuming you have this function)
      const [tfQuestions] = await db.promise().query(
        `SELECT 
          id, 
          questionIndex, 
          questionName AS question, 
          'true-false' AS type,
          correctAnswer
        FROM tfquestions
        WHERE moduleId = ?
        ORDER BY questionIndex`,
        [moduleId]
      );
      
      questions = [...mcQuestions, ...tfQuestions].sort((a, b) => a.questionIndex - b.questionIndex);
      
      // Get student's answers for this attempt (assuming you have an answers table)
      [studentAnswers] = await db.promise().query(
        `SELECT questionId, answer, isCorrect AS trueOrFalse
         FROM student_answers
         WHERE attemptId = ?`,
        [attemptId]
      );
    }
    
    // Combine question and answer data
    const combinedData = questions.map(question => {
      const studentAnswer = studentAnswers.find(answer => answer.questionId === question.id) || {};
      
      return {
        id: question.id,
        questionIndex: question.questionIndex,
        question: question.question,
        type: question.type || 'manual-graded',
        sampleAnswer: question.sampleAnswer || null,
        options: question.options || null,
        correctAnswer: question.correctAnswer || null,
        studentAnswer: studentAnswer.answer || null,
        graded: studentAnswer.trueOrFalse !== null,
        isCorrect: studentAnswer.trueOrFalse
      };
    });
    
    res.status(200).json({
      success: true,
      attemptId,
      userId,
      moduleId,
      userAttemptNumber: attemptInfo[0].userAttemptNumber,
      questions: combinedData
    });
    
  } catch (error) {
    console.error('Error fetching attempt details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch attempt details ❌' 
    });
  }
};