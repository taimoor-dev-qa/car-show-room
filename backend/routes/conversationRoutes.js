const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { startConversation, getMyConversations, getMessages } = require('../controllers/conversationController');

router.post('/', protect, startConversation);
router.get('/', protect, getMyConversations);
router.get('/:id/messages', protect, getMessages);

module.exports = router;