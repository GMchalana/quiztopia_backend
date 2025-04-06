const db = require("../startup/database");
  
  
  
  
  exports.createPlantCareUser = (userData) => {
    return new Promise((resolve, reject) => {
      const {
        firstName,
        lastName,
        phoneNumber,
        email,
        userName,
        role
      } = userData;

      console.log('in dao', userData);
  
      // Get a connection from the pool
      db.getConnection((connErr, connection) => {
        if (connErr) return reject(connErr);
  
        connection.beginTransaction((beginErr) => {
          if (beginErr) {
            connection.release();
            return reject(beginErr);
          }

          console.log('Hit 01');
          // Check if user exists
          connection.query(
            `SELECT id FROM users WHERE userName = ? OR email = ?`,
            [userName, email],
            (checkErr, checkResults) => {
              if (checkErr) {
                return connection.rollback(() => {
                  connection.release();
                  reject(checkErr);
                });
              }
              console.log('Hit 02');
              if (checkResults.length > 0) {
                return connection.rollback(() => {
                  connection.release();
                  reject(new Error("Phone number or NIC number already exists"));
                });
              }
              console.log('Hit 03'); 
              connection.query(
                `INSERT INTO users (firstName, lastName, phoneNumber, email, userName, role)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [firstName, lastName, phoneNumber, email, userName, role],
                (insertUserErr, insertUserResults) => {
                  if (insertUserErr) {
                    return connection.rollback(() => {
                      connection.release();
                      reject(insertUserErr);
                    });
                  }
              
                  const userId = insertUserResults.insertId;
              
                  connection.commit((commitErr) => {
                    if (commitErr) {
                      return connection.rollback(() => {
                        connection.release();
                        reject(commitErr);
                      });
                    }
              
                    connection.release();
                    resolve({
                      message: "User created successfully",
                      userId: userId
                    });
                  });
                }
              );
              
            }
          );
        });
      });
    });
  };