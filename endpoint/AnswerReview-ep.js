const moduleDAO = require('../dao/StAnswers-dao');
const db = require("../startup/database");


exports.getStudentAttempts = async (req, res) => {
    const { moduleId } = req.params;
    
    try {
      // First verify this is an auto-graded module
      const [moduleInfo] = await db.promise().query(
        `SELECT id, moduleName, numOfQuestions, manualOrAuto 
         FROM module 
         WHERE id = ? AND manualOrAuto = 'auto'`,
        [moduleId]
      );
      
      if (!moduleInfo || moduleInfo.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Auto-graded module not found' 
        });
      }
      
      const totalQuestions = moduleInfo[0].numOfQuestions;
      
      // Get all student attempts for this module with calculated scores
      const [attempts] = await db.promise().query(
        `SELECT 
          qa.id AS attemptId,
          qa.userId,
          u.userName,
          qa.userAttemptNumber,
          qa.createdAt AS attemptDate,
          (SELECT COUNT(*) 
           FROM student_answers sa 
           JOIN mcqanswers ma ON sa.questionId = ma.mcqId AND sa.selectedAnswerIndex = ma.id
           WHERE sa.attemptId = qa.id AND ma.trueOrFalse = true) AS correctAnswers
         FROM quizattempt qa
         JOIN users u ON qa.userId = u.id
         WHERE qa.moduleId = ?
         ORDER BY u.lastName, u.firstName, qa.createdAt DESC`,
        [moduleId]
      );
      
      // Transform the data to include the score as a fraction
      const attemptsWithScores = attempts.map(attempt => ({
        attemptId: attempt.attemptId,
        userId: attempt.userId,
        studentName: attempt.userName,
        attemptNumber: attempt.userAttemptNumber,
        attemptDate: attempt.attemptDate,
        score: attempt.correctAnswers,
        totalQuestions: totalQuestions,
        percentage: Math.round((attempt.correctAnswers / totalQuestions) * 100)
      }));
      
      res.status(200).json({
        success: true,
        moduleId: moduleId,
        moduleName: moduleInfo[0].moduleName,
        attempts: attemptsWithScores
      });
      
    } catch (error) {
      console.error('Error fetching student attempts:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch student attempts ❌' 
      });
    }
  };





  exports.getManualStudentAttempts = async (req, res) => {
    const { moduleId } = req.params;
    
    try {
      // First verify this is a manual-graded module
      const [moduleInfo] = await db.promise().query(
        `SELECT id, moduleName, numOfQuestions, manualOrAuto 
         FROM module 
         WHERE id = ? AND manualOrAuto = 'manual'`,
        [moduleId]
      );
      
      if (!moduleInfo || moduleInfo.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Manual-graded module not found' 
        });
      }
      
      const totalQuestions = moduleInfo[0].numOfQuestions;
      
      // Get all student attempts for this manual module with calculated scores
      const [attempts] = await db.promise().query(
        `SELECT 
          qa.id AS attemptId,
          qa.userId,
          u.userName,
          qa.userAttemptNumber,
          qa.createdAt AS attemptDate,
          (SELECT COUNT(*) 
           FROM manual_answers ma 
           WHERE ma.attemptId = qa.id AND ma.trueOrFalse = true) AS correctAnswers,
          (SELECT COUNT(*) 
           FROM manual_answers ma 
           WHERE ma.attemptId = qa.id AND ma.trueOrFalse IS NOT NULL) AS gradedAnswers
         FROM quizattempt qa
         JOIN users u ON qa.userId = u.id
         WHERE qa.moduleId = ?
         ORDER BY u.lastName, u.firstName, qa.createdAt DESC`,
        [moduleId]
      );
      
      // Transform the data to include the score as a fraction and grading status
      const attemptsWithScores = attempts.map(attempt => {
        const isFullyGraded = attempt.gradedAnswers === totalQuestions;
        
        return {
          attemptId: attempt.attemptId,
          userId: attempt.userId,
          studentName: attempt.userName,
          attemptNumber: attempt.userAttemptNumber,
          attemptDate: attempt.attemptDate,
          score: attempt.correctAnswers,
          totalQuestions: totalQuestions,
          gradedQuestions: attempt.gradedAnswers,
          percentage: isFullyGraded ? Math.round((attempt.correctAnswers / totalQuestions) * 100) : null,
          gradingStatus: isFullyGraded ? 'Fully graded' : 
                         (attempt.gradedAnswers > 0 ? 'Partially graded' : 'Not graded')
        };
      });
      
      res.status(200).json({
        success: true,
        moduleId: moduleId,
        moduleName: moduleInfo[0].moduleName,
        attempts: attemptsWithScores
      });
      
    } catch (error) {
      console.error('Error fetching manual student attempts:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch manual student attempts ❌' 
      });
    }
  };





  exports.getManualAttemptDetails = async (req, res) => {
    const { attemptId } = req.params;
    
    try {
      // First, get the attempt information to identify the module and user
      const [attemptInfo] = await db.promise().query(
        `SELECT qa.id, qa.userId, qa.moduleId, qa.userAttemptNumber, qa.createdAt,
                u.userName, m.moduleName, m.manualOrAuto
         FROM quizattempt qa
         JOIN users u ON qa.userId = u.id
         JOIN module m ON qa.moduleId = m.id
         WHERE qa.id = ?`,
        [attemptId]
      );
      
      if (!attemptInfo || attemptInfo.length === 0) {
        return res.status(404).json({ success: false, error: 'Attempt not found' });
      }
      
      const attempt = attemptInfo[0];
      
      // Verify this is a manual-graded module
      if (attempt.manualOrAuto !== 'manual') {
        return res.status(400).json({ 
          success: false, 
          error: 'This endpoint is only for manual-graded modules' 
        });
      }
      
      // Get all questions for this module
      const [questions] = await db.promise().query(
        `SELECT id, questionIndex, question, sampleAnswer 
         FROM manualgradedquestions 
         WHERE moduleId = ? 
         ORDER BY questionIndex`,
        [attempt.moduleId]
      );
      
      // Get student's answers for this attempt
      const [studentAnswers] = await db.promise().query(
        `SELECT questionId, answer, trueOrFalse, submittedAt 
         FROM manual_answers 
         WHERE attemptId = ?`,
        [attemptId]
      );
      
      // Combine questions with student answers
      const detailedQuestions = questions.map(question => {
        const studentAnswer = studentAnswers.find(a => a.questionId === question.id) || {};
        
        return {
          questionId: question.id,
          questionIndex: question.questionIndex,
          question: question.question,
          sampleAnswer: question.sampleAnswer,
          studentAnswer: studentAnswer.answer || null,
          isGraded: studentAnswer.trueOrFalse !== undefined && studentAnswer.trueOrFalse !== null,
          isCorrect: studentAnswer.trueOrFalse,
          submittedAt: studentAnswer.submittedAt || null
        };
      });
      
      // Calculate score summary
      const gradedQuestions = detailedQuestions.filter(q => q.isGraded);
      const correctAnswers = detailedQuestions.filter(q => q.isCorrect).length;
      
      const scoreSummary = {
        totalQuestions: questions.length,
        gradedQuestions: gradedQuestions.length,
        correctAnswers: correctAnswers,
        percentage: gradedQuestions.length > 0 
          ? Math.round((correctAnswers / questions.length) * 100) 
          : null,
        gradingStatus: gradedQuestions.length === questions.length 
          ? 'Fully graded' 
          : (gradedQuestions.length > 0 ? 'Partially graded' : 'Not graded')
      };
      
      res.status(200).json({
        success: true,
        attemptId: attempt.id,
        student: {
          id: attempt.userId,
          name: attempt.userName
        },
        module: {
          id: attempt.moduleId,
          name: attempt.moduleName
        },
        attemptNumber: attempt.userAttemptNumber,
        attemptDate: attempt.createdAt,
        scoreSummary: scoreSummary,
        questions: detailedQuestions
      });
      
    } catch (error) {
      console.error('Error fetching manual attempt details:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch attempt details ❌' 
      });
    }
  };










  exports.updateManualGrades = async (req, res) => {
    const { attemptId } = req.params;
    const { grades } = req.body;
    
    if (!attemptId || !grades || !Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request data. Please provide attemptId and grades array.' 
      });
    }
    
    let connection;
    
    try {
      // Verify the attempt exists and is for a manual module
      const [attemptInfo] = await db.promise().query(
        `SELECT qa.id, m.manualOrAuto 
         FROM quizattempt qa
         JOIN module m ON qa.moduleId = m.id
         WHERE qa.id = ?`,
        [attemptId]
      );
      
      if (!attemptInfo || attemptInfo.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Attempt not found' 
        });
      }
      
      if (attemptInfo[0].manualOrAuto !== 'manual') {
        return res.status(400).json({ 
          success: false, 
          error: 'This endpoint is only for manual-graded modules' 
        });
      }
      
      // Get a connection from the pool
      connection = await db.promise().getConnection();
      await connection.beginTransaction();
      
      try {
        // Update each grade in the database
        const updatePromises = grades.map(grade => {
          const isCorrect = grade.isCorrect === 1 || grade.isCorrect === true;
          
          return connection.query(
            `UPDATE manual_answers 
             SET trueOrFalse = ? 
             WHERE attemptId = ? AND questionId = ?`,
            [isCorrect, attemptId, grade.questionId]
          );
        });
        
        const results = await Promise.all(updatePromises);
        
        // Check if any updates were made
        const totalUpdated = results.reduce((sum, result) => sum + result[0].affectedRows, 0);
        
        if (totalUpdated === 0) {
          await connection.rollback();
          return res.status(404).json({ 
            success: false, 
            error: 'No matching answers found to update' 
          });
        }
        
        // Get updated grading summary
        const [summary] = await connection.query(
          `SELECT 
            COUNT(*) AS totalAnswers,
            SUM(CASE WHEN trueOrFalse IS NOT NULL THEN 1 ELSE 0 END) AS gradedAnswers,
            SUM(CASE WHEN trueOrFalse = true THEN 1 ELSE 0 END) AS correctAnswers
           FROM manual_answers
           WHERE attemptId = ?`,
          [attemptId]
        );
        
        await connection.commit();
        
        res.status(200).json({
          success: true,
          message: `Successfully updated ${totalUpdated} grades`,
          attemptId,
          gradingSummary: {
            totalAnswers: summary[0].totalAnswers,
            gradedAnswers: summary[0].gradedAnswers,
            correctAnswers: summary[0].correctAnswers,
            percentage: Math.round((summary[0].correctAnswers / summary[0].totalAnswers) * 100),
            isFullyGraded: summary[0].gradedAnswers === summary[0].totalAnswers
          }
        });
        
      } catch (error) {
        if (connection) await connection.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error updating manual grades:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update grades ❌' 
      });
    } finally {
      if (connection) connection.release();
    }
  };