const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    startConversation,
    getMyConversations,
    getMessages,
    markMessagesAsRead,
    deleteConversation,
} = require('../controllers/conversationController');
router.post('/', protect, startConversation);
router.get('/', protect, getMyConversations);
router.get('/:id/messages', protect, getMessages);
router.patch('/:id/read', protect, markMessagesAsRead);
router.delete('/:id', protect, deleteConversation);

module.exports = router;
