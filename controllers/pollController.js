const db = require('../config/db');


exports.createPoll = (req, res) => {
    if (req.body.accessRole !== 'Institute') return res.status(403).send({ message: 'Forbidden' });

    const { question, options, role } = req.body;

    db.query('INSERT INTO polls (question, createdBy, role) VALUES (?, ?, ?)', 
        [question, req.user.id, role], (err, result) => {
        if (err) return res.status(500).send(err);

        const pollId = result.insertId;
        const optionValues = options.map(option => [pollId, option]);

        db.query('INSERT INTO poll_options (pollId, optionText) VALUES ?', [optionValues], (err) => {
            if (err) return res.status(500).send(err);
            res.status(201).send({ message: 'Poll created' });
        });
    });
};

exports.getAllPolls = (req, res) => {
    db.query(`
        SELECT 
            polls.id, 
            polls.question, 
            polls.role,
            polls.createdBy,
            CONCAT(
                '[', 
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'optionText', poll_options.optionText, 
                        'votes', COALESCE(vote_counts.votes, 0)
                    )
                ), 
                ']'
            ) AS options 
        FROM polls 
        JOIN poll_options ON polls.id = poll_options.pollId 
        LEFT JOIN (
            SELECT 
                optionId, 
                COUNT(*) AS votes 
            FROM user_votes 
            GROUP BY optionId
        ) AS vote_counts ON poll_options.id = vote_counts.optionId 
        GROUP BY polls.id, polls.question, polls.role
    `, (err, results) => {
        if (err) return res.status(500).send(err);

        const formattedResults = results.map(result => ({
            id: result.id,
            question: result.question,
            role: result.role,
            createdBy: result.createdBy,
            options: JSON.parse(result.options)
        }));

        res.json(formattedResults);
    });
};



exports.getPollsByRole = (req, res) => {
    const { role, questionId } = req.params;
    // Use JOIN to fetch data from both tables based on role and questionId, including vote count
    const query = `
        SELECT p.id AS poll_id, p.role, p.question, po.id AS option_id, po.optionText,
               COUNT(DISTINCT uv.userId) AS voteCount
        FROM polls p
        LEFT JOIN poll_options po ON p.id = po.pollId
        LEFT JOIN user_votes uv ON p.id = uv.pollId AND po.id = uv.optionId
        WHERE p.role = ? AND p.id = ?
        GROUP BY po.id
    `;

    db.query(query, [role, questionId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Polls not found' });
        }

        const formattedData = {
            question: {
                id: results[0].poll_id,
                role: results[0].role,
                question: results[0].question 
            },
            options: results.map(row => ({
                id: row.option_id,
                optionText: row.optionText,
                voteCount: row.voteCount
            }))
        };

        res.json(formattedData);
    });
};


exports.vote = (req, res) => {
    const { pollId, optionId } = req.body;
    const userId = req.user.id;

    // Check if optionId exists in poll_options for the given pollId
    db.query('SELECT * FROM poll_options WHERE pollId = ? AND id = ?', [pollId, optionId], (err, optionResults) => {
        if (err) return res.status(500).send(err);
        if (optionResults.length === 0) {
            return res.status(404).send({ message: 'Option not found for the specified poll' });
        }

        // Check if the user has already voted
        db.query('SELECT * FROM user_votes WHERE pollId = ? AND userId = ?', [pollId, userId], (err, voteResults) => {
            if (err) return res.status(500).send(err);

            if (voteResults.length > 0) {
                // User has already voted, update the vote
                db.query('UPDATE user_votes SET optionId = ? WHERE pollId = ? AND userId = ?', [optionId, pollId, userId], (err, result) => {
                    if (err) return res.status(500).send(err);
                    res.status(200).send({ message: 'Vote updated' });
                });
            } else {
                // Insert a new vote
                db.query('INSERT INTO user_votes (pollId, optionId, userId) VALUES (?, ?, ?)', [pollId, optionId, userId], (err, result) => {
                    if (err) return res.status(500).send(err);
                    res.status(201).send({ message: 'Vote recorded' });
                });
            }
        });
    });
};



exports.deletePoll = (req, res) => {
    const pollId = req.params.id;

    db.query('DELETE FROM polls WHERE id = ?', [pollId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send({ message: 'Poll deleted' });
    });
};
