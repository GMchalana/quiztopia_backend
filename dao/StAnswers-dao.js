const db = require("../startup/database");
const util = require('util');


exports.saveStudentAnswersWithAttempt = async (userId, moduleId, answers) => {
  const getConnection = util.promisify(db.getConnection).bind(db);
  const conn = await getConnection();

  const beginTransaction = util.promisify(conn.beginTransaction).bind(conn);
  const query = util.promisify(conn.query).bind(conn);
  const commit = util.promisify(conn.commit).bind(conn);
  const rollback = util.promisify(conn.rollback).bind(conn);
  const release = conn.release.bind(conn);

  try {
    await beginTransaction();

    // Step 1: Get last userAttemptNumber
    const [lastAttemptRow] = await query(
      `SELECT MAX(userAttemptNumber) AS lastAttempt FROM quizattempt WHERE userId = ? AND moduleId = ?`,
      [userId, moduleId]
    );
    const lastAttemptNumber = lastAttemptRow.lastAttempt || 0;
    const newAttemptNumber = lastAttemptNumber + 1;

    // Step 2: Create new attempt
    const result = await query(
      `INSERT INTO quizattempt (userId, moduleId, userAttemptNumber) VALUES (?, ?, ?)`,
      [userId, moduleId, newAttemptNumber]
    );
    const attemptId = result.insertId;

    // Step 3: Insert answers with attemptId
    for (const [questionId, selectedAnswerIndex] of Object.entries(answers)) {
      await query(
        `INSERT INTO student_answers (userId, moduleId, questionId, attemptId, selectedAnswerIndex)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, moduleId, questionId, attemptId, selectedAnswerIndex]
      );
    }

    await commit();
  } catch (err) {
    await rollback();
    throw err;
  } finally {
    release();
  }
};
