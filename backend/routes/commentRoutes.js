const express = require('express');
const { addComment, getComments, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(protect, getComments)
  .post(protect, addComment);

router.delete('/:commentId', protect, deleteComment);

module.exports = router;