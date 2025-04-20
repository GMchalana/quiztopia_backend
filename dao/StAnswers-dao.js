const db = require("../startup/database");
const util = require('util');


exports.saveStudentAnswers = async (userId, moduleId, answers) => {
    // Promisify the getConnection function
    const getConnection = util.promisify(db.getConnection).bind(db);
  
    const conn = await getConnection();
  
    // Promisify the conn methods
    const beginTransaction = util.promisify(conn.beginTransaction).bind(conn);
    const query = util.promisify(conn.query).bind(conn);
    const commit = util.promisify(conn.commit).bind(conn);
    const rollback = util.promisify(conn.rollback).bind(conn);
    const release = conn.release.bind(conn); // release is sync
  
    try {
      await beginTransaction();
  
      for (const [questionId, selectedAnswerIndex] of Object.entries(answers)) {
        await query(
          `INSERT INTO student_answers (userId, moduleId, questionId, selectedAnswerIndex)
           VALUES (?, ?, ?, ?)`,
          [userId, moduleId, questionId, selectedAnswerIndex]
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