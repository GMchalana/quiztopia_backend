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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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




module.exports = {
    createUsersTable
};