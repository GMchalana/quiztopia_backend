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
      password TEXT DEFAULT NULL,
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
      manualOrAuto VARCHAR(50) DEFAULT NULL,
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


const createModuleRatingsTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS moduleratings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      moduleId INT DEFAULT NULL,
      userId INT DEFAULT NULL,
      numOfStars INT DEFAULT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (moduleId) REFERENCES module(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating manualgradedquestions table: ' + err);
            } else {
                resolve('moduleratings table created successfully. ✅');
            }
        });
    });
};

const createQuizattemptTable = () => {
    const sql = `
        CREATE TABLE quizattempt (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        moduleId INT NOT NULL,
        userAttemptNumber INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (moduleId) REFERENCES module(id)
        )
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating quizattempt table: ' + err);
            } else {
                resolve('quizattempt table created successfully. ✅');
            }
        });
    });
};


const createStudentAnswerTable = () => {
    const sql = `
    CREATE TABLE student_answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        moduleId INT NOT NULL,
        questionId INT NOT NULL,
        attemptId INT NOT NULL,
        selectedAnswerIndex INT NOT NULL, 
        submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (moduleId) REFERENCES module(id),
        FOREIGN KEY (questionId) REFERENCES mcquestions(id),
        FOREIGN KEY (attemptId) REFERENCES quizattempt(id)
);
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating student_answers table: ' + err);
            } else {
                resolve('student_answers table created successfully. ✅');
            }
        });
    });
};










const createManualAnswerTable = () => {
    const sql = `
    CREATE TABLE manual_answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        moduleId INT NOT NULL,
        questionId INT NOT NULL,
        attemptId INT NOT NULL,
        answer TEXT DEFAULT NULL, 
        trueOrFalse BOOLEAN DEFAULT NULL, 
        submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (moduleId) REFERENCES module(id),
        FOREIGN KEY (questionId) REFERENCES manualgradedquestions(id),
        FOREIGN KEY (attemptId) REFERENCES quizattempt(id)
)
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject('Error creating manual_answers table: ' + err);
            } else {
                resolve('manual_answers table created successfully. ✅');
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
    createManualGradedQuestionsTable,
    createModuleRatingsTable,
    createQuizattemptTable,
    createStudentAnswerTable,
    createManualAnswerTable
};