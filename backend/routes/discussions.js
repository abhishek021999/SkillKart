const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');
const { auth } = require('../middleware/auth');

// Get all discussions for a roadmap
router.get('/roadmap/:roadmapId', async (req, res) => {
  try {
    const discussions = await Discussion.find({ roadmap: req.params.roadmapId })
      .populate('author', 'email profile.name')
      .populate('comments.author', 'email profile.name')
      .sort('-createdAt');
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching discussions', error: error.message });
  }
});

// Get discussions for a specific topic
router.get('/topic/:topicId', async (req, res) => {
  try {
    const discussions = await Discussion.find({ topic: req.params.topicId })
      .populate('author', 'email profile.name')
      .populate('comments.author', 'email profile.name')
      .sort('-createdAt');
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching discussions', error: error.message });
  }
});

// Create new discussion
router.post('/', auth, async (req, res) => {
  try {
    const discussion = new Discussion({
      ...req.body,
      author: req.user._id
    });

    await discussion.save();
    await discussion.populate('author', 'email profile.name');
    res.status(201).json(discussion);
  } catch (error) {
    res.status(400).json({ message: 'Error creating discussion', error: error.message });
  }
});

// Add comment to discussion
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    discussion.comments.push({
      content: req.body.content,
      author: req.user._id
    });

    await discussion.save();
    await discussion.populate('comments.author', 'email profile.name');
    res.json(discussion);
  } catch (error) {
    res.status(400).json({ message: 'Error adding comment', error: error.message });
  }
});

// Like/Unlike discussion
router.put('/:id/like', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const likeIndex = discussion.likes.indexOf(req.user._id);
    
    if (likeIndex === -1) {
      discussion.likes.push(req.user._id);
    } else {
      discussion.likes.splice(likeIndex, 1);
    }

    await discussion.save();
    res.json(discussion);
  } catch (error) {
    res.status(400).json({ message: 'Error updating like', error: error.message });
  }
});

// Like/Unlike comment
router.put('/:discussionId/comments/:commentId/like', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const comment = discussion.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const likeIndex = comment.likes.indexOf(req.user._id);
    
    if (likeIndex === -1) {
      comment.likes.push(req.user._id);
    } else {
      comment.likes.splice(likeIndex, 1);
    }

    await discussion.save();
    res.json(discussion);
  } catch (error) {
    res.status(400).json({ message: 'Error updating like', error: error.message });
  }
});

// Edit a comment (answer) in a discussion
router.put('/:discussionId/comments/:commentId', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    const comment = discussion.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this answer' });
    }
    comment.content = req.body.content;
    await discussion.save();
    await discussion.populate('comments.author', 'email profile.name');
    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: 'Error editing answer', error: error.message });
  }
});

// Delete a comment (answer) in a discussion
router.delete('/:discussionId/comments/:commentId', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    const comment = discussion.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this answer' });
    }
    discussion.comments.pull(req.params.commentId);
    await discussion.save();
    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting answer', error: error.message });
  }
});

// Delete discussion (author only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (discussion.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this discussion' });
    }

    await Discussion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting discussion', error: error.message });
  }
});

// Edit a discussion (question) by its author
router.put('/:id', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    if (discussion.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this discussion' });
    }
    discussion.title = req.body.title || discussion.title;
    discussion.content = req.body.content || discussion.content;
    await discussion.save();
    await discussion.populate('author', 'email profile.name');
    res.json(discussion);
  } catch (error) {
    res.status(400).json({ message: 'Error editing discussion', error: error.message });
  }
});

module.exports = router; 