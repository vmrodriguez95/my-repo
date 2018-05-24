const MYSQL = require('mysql');
const DB_HOST = process.env.IP || 'localhost';
const DB_USER = 'vmrodriguez';
const DB_NAME = 'c9';

class Database {
    constructor(config) {
        this.connection = MYSQL.createConnection(config);
    }
    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if(err)
                    return reject(err);
                resolve(rows);
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end((err) => {
                if(err)
                    return reject(err);
                resolve();
            });
        });
    }
}

const database = new Database({ host: DB_HOST, database: DB_NAME, user: DB_USER, password: '' });
const mysqlStatements = (() => {
    let sql = "";
    const users = {
        getUser: (uid) => {
            return new Promise((resolve, reject) => {
                sql = `SELECT uid FROM users WHERE uid = \"${uid}\"`;
                database.query(sql).then((result) => {
                    resolve(result);
                });
            });
        },
        insertUser: (uid) => {
            return new Promise((resolve, reject) => {
                sql = `INSERT INTO users VALUES (null, \"${uid}\")`;
                database.query(sql).then((result) => {
                    resolve(result);
                });
            });
        },
        checkUser: (uid) => {
            users.getUser(uid).then((result) => {
                if(result.length === 0) {
                    users.insertUser(uid).then((result) => {
                        console.log("User was registered correctly");
                        return "OK";
                    }).catch((err) => {
                        console.log("Problems to register user");
                        return "KO";
                    });
                } else {
                    console.log("User is registered already");
                    return "OK";
                }
            });
        }
    }
    
    return {users};
})();

module.exports = mysqlStatements;