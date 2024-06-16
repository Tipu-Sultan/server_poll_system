const User = require('../models/User');

exports.getAllUsers = (req, res) => {
    User.getAll((err, results) => {
        if (err) throw err;
        res.json(results);
    });
};

exports.getUserById = (req, res) => {
    User.findById(req.params.id, (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
};

exports.updateUser = (req, res) => {
    User.update(req.params.id, req.body, (err, results) => {
        if (err) throw err;
        res.json({ msg: 'User updated' });
    });
};

exports.deleteUser = (req, res) => {
    User.delete(req.params.id, (err, results) => {
        if (err) throw err;
        res.json({ msg: 'User deleted' });
    });
};
