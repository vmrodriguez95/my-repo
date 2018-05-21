const MYSQL = require('mysql');
const DB_HOST = process.env.IP || 'localhost';
const DB_USER = 'vmrodriguez';
const DB_NAME = 'c9';

const connection = MYSQL.createConnection({
    host: DB_HOST,
    database: DB_NAME,
    user: DB_USER,
    password: ''
});

function start(callback) {
    connection.connect((err) => {
        if (err) throw err;
        console.log("Connected!");
        
        callback(connection);
    });
}

const mysqlStatements = (() => {
    let sql = "";
    
    const users = {
        get: (uid) => {
            start((con) => {
                let queryResult = "";
                
                sql = `SELECT u.uid FROM users AS u WHERE u.uid = \"${uid}\"`;
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    queryResult = result;
                });
                
                return queryResult;
            });
        },
        insert: (uid) => {
            start((con) => {
                sql = `INSERT INTO users VALUES (null, \"${uid}\")`;
                con.query(sql, function (err, result) {
                    if (err) throw err;
                });
            });
        }
    }
    
    return {users};
})();

module.exports = mysqlStatements;