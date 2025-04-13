const db = require("../startup/database");


exports.getAllModules = (email) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM module WHERE deleteStatus = 0";
      db.query(sql, [email], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  };




exports.createModule = (moduleName, numOfQuestions, estimationTime) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO module (moduleName, numOfQuestions, estimationTime, deleteStatus) VALUES (?, ?, ?, false)`;
      db.query(sql, [moduleName, numOfQuestions, estimationTime], (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  };
  
  exports.createMcQuestion = (moduleId, index, question) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO mcquestions (moduleId, questionIndex, questionName) VALUES (?, ?, ?)`;
      db.query(sql, [moduleId, index, question], (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  };
  
  exports.createMcqAnswer = (mcqId, answer, isCorrect) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO mcqanswers (mcqId, answer, trueOrFalse) VALUES (?, ?, ?)`;
      db.query(sql, [mcqId, answer, isCorrect], (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  };
  
  exports.createTfQuestion = (moduleId, index, question, isTrue) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO tfquestions (moduleId, questionIndex, question, trueOrFalse) VALUES (?, ?, ?, ?)`;
      db.query(sql, [moduleId, index, question, isTrue], (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  };










  exports.getMcQuestionsByModuleId = (moduleId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          mc.id, 
          mc.questionIndex, 
          mc.questionName AS question, 
          'multiple-choice' AS type,
          JSON_ARRAYAGG(JSON_OBJECT('id', a.id, 'answer', a.answer, 'trueOrFalse', a.trueOrFalse)) AS options
        FROM mcquestions mc
        JOIN mcqanswers a ON mc.id = a.mcqId
        WHERE mc.moduleId = ?
        GROUP BY mc.id
      `;
      db.query(sql, [moduleId], (err, results) => {
        if (err) return reject(err);
        resolve(results.map(q => ({
          ...q,
          options: q.options
        })));
      });
    });
  };
  
  exports.getTfQuestionsByModuleId = (moduleId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          id,
          questionIndex,
          question,
          trueOrFalse AS correctAnswer,
          'true-false' AS type,
          JSON_ARRAY('True', 'False') AS options
        FROM tfquestions
        WHERE moduleId = ?
      `;
      db.query(sql, [moduleId], (err, results) => {
        if (err) return reject(err);
        resolve(results.map(q => ({
          ...q,
          options: q.options
        })));
      });
    });
  };
  




  exports.deleteModuleById = (moduleId) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM module WHERE id = ?`;
      db.query(sql, [moduleId], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };
  