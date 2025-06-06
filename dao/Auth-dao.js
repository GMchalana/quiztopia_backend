const db = require("../startup/database");
  
  
  
  
  exports.createPlantCareUser = (userData) => {
    return new Promise((resolve, reject) => {
      const {
        email,
        password,
        role,
        userName


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
                `INSERT INTO users (email, userName, role, password)
                 VALUES (?, ?, ?, ?)`,
                [email, userName, role, password],
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











  exports.login = (email) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM users WHERE email = ?";
      db.query(sql, [email], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  };