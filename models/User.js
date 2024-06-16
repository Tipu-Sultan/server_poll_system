const db = require('../config/db');

const User = {
    create: (user, callback) => {
        const sql = 'INSERT INTO users SET ?';
        db.query(sql, user, callback);
    },
    findByEmail: (email, callback) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.query(sql, [email], callback);
    },
    findById: (id, callback) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        db.query(sql, [id], callback);
    },
    update: (id, user, callback) => {
        const sql = 'UPDATE users SET ? WHERE id = ?';
        db.query(sql, [user, id], callback);
    },
    delete: (id, callback) => {
        const sql = 'DELETE FROM users WHERE id = ?';
        db.query(sql, [id], callback);
    },
    getAll: (callback) => {
        const sql = 'SELECT * FROM users';
        db.query(sql, callback);
    }
};

module.exports = User;
