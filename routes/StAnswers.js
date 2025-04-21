const express = require('express');
const router = express.Router();
const moduleController = require('../endpoint/StAnswers-ep');
const db = require("../startup/database");

router.post('/submit-answers', moduleController.submitAnswers);

router.get("/quiz-attempts/:userId", (req, res) => {
  const userId = req.params.userId;

  // First, get all attempts by this user
  const attemptsQuery = `
    SELECT 
      qa.id AS attemptId,
      qa.moduleId,
      m.moduleName,
      qa.createdAt
    FROM quizattempt qa
    INNER JOIN module m ON m.id = qa.moduleId
    WHERE qa.userId = ?
    ORDER BY qa.createdAt DESC
  `;
  
  db.query(attemptsQuery, [userId], (attemptsErr, attempts) => {
    if (attemptsErr) {
      console.error("Error fetching attempts:", attemptsErr);
      return res.status(500).json({ error: "Failed to fetch quiz attempts" });
    }
    
    if (attempts.length === 0) {
      return res.json([]);
    }
    
    const result = [];
    let processed = 0;
    
    // Process each attempt
    attempts.forEach(attempt => {
      const moduleId = attempt.moduleId;
      const attemptId = attempt.attemptId;
      
      // Get total questions for this module
      const totalQuery = `
        SELECT COUNT(*) AS total 
        FROM mcquestions 
        WHERE moduleId = ?
      `;
      
      db.query(totalQuery, [moduleId], (totalErr, totalResult) => {
        if (totalErr) {
          console.error("Error fetching total questions:", totalErr);
          return res.status(500).json({ error: "Failed to fetch quiz total" });
        }
        
        const total = totalResult[0].total;
        
        // Get correct answers for this attempt
        // This query is fixed to correctly count answers where student selected the correct option
        const correctQuery = `
          SELECT COUNT(*) AS correct
          FROM student_answers sa
          JOIN mcqanswers a ON a.mcqId = sa.questionId AND a.id = sa.selectedAnswerIndex
          WHERE sa.userId = ? 
            AND sa.moduleId = ? 
            AND sa.attemptId = ?
            AND a.trueOrFalse = 1
        `;
        
        db.query(correctQuery, [userId, moduleId, attemptId], (correctErr, correctResult) => {
          if (correctErr) {
            console.error("Error fetching correct answers:", correctErr);
            return res.status(500).json({ error: "Failed to fetch correct answers" });
          }
          
          const correct = correctResult[0].correct;
          
          result.push({
            attemptId,
            moduleId,
            moduleName: attempt.moduleName,
            correct,
            total,
            attemptDate: attempt.createdAt
          });
          
          processed++;
          
          // If we've processed all attempts, return the result
          if (processed === attempts.length) {
            res.json(result);
          }
        });
      });
    });
  });
});








// Get detailed module quiz review with questions, all answers, and complete student response data
router.get("/module-review/:userId/:moduleId/:attemptId", (req, res) => {
    const userId = req.params.userId;
    const moduleId = req.params.moduleId;
    const attemptId = req.params.attemptId;
    
    // First get all questions for this module
    const questionsQuery = `
      SELECT 
        q.id AS questionId,
        q.questionIndex,
        q.questionName
      FROM mcquestions q
      WHERE q.moduleId = ?
      ORDER BY q.questionIndex
    `;
    
    db.query(questionsQuery, [moduleId], (questionErr, questions) => {
      if (questionErr) {
        console.error("Error fetching questions:", questionErr);
        return res.status(500).json({ error: "Failed to fetch module questions" });
      }
      
      if (questions.length === 0) {
        return res.json({ 
          moduleId,
          attemptId,
          questions: [] 
        });
      }
      
      // Process each question to get its answers and student selection
      const result = {
        moduleId,
        attemptId,
        questions: []
      };
      
      let processedQuestions = 0;
      
      questions.forEach(question => {
        const questionId = question.questionId;
        
        // Get all possible answers for this question
        const answersQuery = `
          SELECT 
            a.id AS answerId,
            a.answer,
            a.trueOrFalse
          FROM mcqanswers a
          WHERE a.mcqId = ?
          ORDER BY a.id
        `;
        
        db.query(answersQuery, [questionId], (answerErr, answers) => {
          if (answerErr) {
            console.error("Error fetching answers:", answerErr);
            return res.status(500).json({ error: "Failed to fetch question answers" });
          }
          
          // Get student's selected answer for this question in this attempt
          const studentAnswerQuery = `
            SELECT 
              sa.selectedAnswerIndex,
              sa.id AS studentAnswerId,
              sa.submittedAt
            FROM student_answers sa
            WHERE sa.userId = ? 
              AND sa.moduleId = ? 
              AND sa.attemptId = ?
              AND sa.questionId = ?
            LIMIT 1
          `;
          
          db.query(studentAnswerQuery, [userId, moduleId, attemptId, questionId], (studentErr, studentAnswers) => {
            if (studentErr) {
              console.error("Error fetching student answer:", studentErr);
              return res.status(500).json({ error: "Failed to fetch student answers" });
            }
            
            // Find the correct answer for this question
            const correctAnswer = answers.find(ans => ans.trueOrFalse === 1);
            
            // Initialize question data
            const questionData = {
              questionId: question.questionId,
              questionIndex: question.questionIndex,
              questionText: question.questionName,
              answers: answers.map(ans => ({
                answerId: ans.answerId,
                answerText: ans.answer,
                isCorrect: ans.trueOrFalse === 1
              })),
              userResponse: null,
              isCorrect: false
            };
            
            // If student answered this question, add their response
            if (studentAnswers.length > 0) {
              const studentAnswer = studentAnswers[0];
              const selectedAnswerIndex = studentAnswer.selectedAnswerIndex;
              
              // Find the selected answer's text
              const selectedAnswer = answers.find(ans => ans.answerId === selectedAnswerIndex);
              
              questionData.userResponse = {
                studentAnswerId: studentAnswer.studentAnswerId,
                selectedAnswerIndex: selectedAnswerIndex,
                selectedAnswerText: selectedAnswer ? selectedAnswer.answer : null,
                submittedAt: studentAnswer.submittedAt
              };
              
              // Determine if the student's answer was correct
              if (correctAnswer && selectedAnswerIndex === correctAnswer.answerId) {
                questionData.isCorrect = true;
              }
            }
            
            result.questions.push(questionData);
            processedQuestions++;
            
            // If we've processed all questions, return the result
            if (processedQuestions === questions.length) {
              // Sort questions by index before returning
              result.questions.sort((a, b) => a.questionIndex - b.questionIndex);
              res.json(result);
            }
          });
        });
      });
    });
  });


  

module.exports = router;