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