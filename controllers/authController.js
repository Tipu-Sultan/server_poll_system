const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = (req, res) => {
    const { name, email, phone, role, password } = req.body;

    User.findByEmail(email, (err, results) => {
        if (results.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const newUser = { name, email, phone, role, password: bcrypt.hashSync(password, 10) };
        User.create(newUser, (err, results) => {
            if (err) throw err;
            const payload = { user: { id: results.insertId } };
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
                if (err) throw err;
                res.json({ token, message: 'User registered' });
            });
        });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    User.findByEmail(email, (err, results) => {
        if (results.length === 0) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const user = results[0];
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;

            // Remove the password from the user object before sending it in the response
            const { password, ...userWithoutPassword } = user;

            res.json({ token, user: userWithoutPassword });
        });
    });
};

exports.logout = (req, res) => {
    res.json({ msg: 'Logged out' });
};
