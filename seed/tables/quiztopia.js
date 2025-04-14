const  db  = require('../../startup/database');



const createUsersTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(50) DEFAULT NULL,
      lastName VARCHAR(50) DEFAULT NULL,
      phoneNumber VARCHAR(12) DEFAULT NULL,
      email VARCHAR(150) DEFAULT NULL,
      userName VARCHAR(50) DEFAULT NULL,
      role VARCHAR(25) DEFAULT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating users table: ' + err);
            } else {
                resolve('Users table created successfully. ✅');
            }
        });
    });
};



const createModuleTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS module (
      id INT AUTO_INCREMENT PRIMARY KEY,
      moduleName VARCHAR(50) DEFAULT NULL,
      numOfQuestions INT(5) DEFAULT NULL,
      estimationTime DECIMAL(15, 2) DEFAULT NULL,
      deleteStatus BOOLEAN DEFAULT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating module table: ' + err);
            } else {
                resolve('module table created successfully. ✅');
            }
        });
    });
};


const createMcQuestionsTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS mcquestions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    moduleId INT DEFAULT NULL,
    questionIndex INT(11) DEFAULT NULL,
    questionName TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (moduleId) REFERENCES module(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating mcquestions table: ' + err);
            } else {
                resolve('mcquestions table created successfully. ✅');
            }
        });
    });
};



const createMcqAnswersTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS mcqanswers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mcqId INT DEFAULT NULL,
      answer TEXT,
      trueOrFalse BOOLEAN DEFAULT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mcqId) REFERENCES mcquestions(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating mcqanswers table: ' + err);
            } else {
                resolve('mcqanswers table created successfully. ✅');
            }
        });
    });
};





const createTfQuestionsTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS tfquestions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      moduleId INT DEFAULT NULL,
      questionIndex INT DEFAULT NULL,
      question TEXT,
      trueOrFalse BOOLEAN DEFAULT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (moduleId) REFERENCES module(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating tfquestions table: ' + err);
            } else {
                resolve('tfquestions table created successfully. ✅');
            }
        });
    });
};




const createManualGradedQuestionsTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS manualgradedquestions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      moduleId INT DEFAULT NULL,
      questionIndex INT DEFAULT NULL,
      question TEXT,
      sampleAnswer TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (moduleId) REFERENCES module(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating manualgradedquestions table: ' + err);
            } else {
                resolve('manualgradedquestions table created successfully. ✅');
            }
        });
    });
};




module.exports = {
    createUsersTable,
    createModuleTable,
    createMcQuestionsTable,
    createMcqAnswersTable,
    createTfQuestionsTable,
    createManualGradedQuestionsTable
};