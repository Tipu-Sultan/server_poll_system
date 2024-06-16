const db = require('../config/db');

const Poll = {
    create: (poll, callback) => {
        const sql = 'INSERT INTO polls SET ?';
        db.query(sql, poll, callback);
    },
    findByRole: (role, callback) => {
        const sql = 'SELECT * FROM polls WHERE role = ?';
        db.query(sql, [role], callback);
    },
    delete: (id, callback) => {
        const sql = 'DELETE FROM polls WHERE id = ?';
        db.query(sql, [id], callback);
    }
};

module.exports = Poll;
