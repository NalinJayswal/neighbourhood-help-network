const Comment = require('../models/Comment');

// Add a comment to a help request
const addComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      helpRequest: req.params.id,
      user: req.user._id,
      text: req.body.text
    });
    await comment.populate('user', 'name');
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all comments for a help request
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ helpRequest: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a comment (only the comment owner)
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addComment, getComments, deleteComment };