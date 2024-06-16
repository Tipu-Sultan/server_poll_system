// routes/pollRoutes.js
const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, pollController.createPoll);
router.get('/:role/:questionId', authMiddleware, pollController.getPollsByRole);
router.get('/', authMiddleware, pollController.getAllPolls); 
router.post('/vote', authMiddleware, pollController.vote);
router.delete('/:id', authMiddleware, pollController.deletePoll);

module.exports = router;
