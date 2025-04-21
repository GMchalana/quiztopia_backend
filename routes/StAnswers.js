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

module.exports = router;