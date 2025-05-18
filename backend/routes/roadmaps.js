const express = require('express');
const router = express.Router();
const Roadmap = require('../models/Roadmap');
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');

// Get all roadmaps
router.get('/', async (req, res) => {
  try {
    const roadmaps = await Roadmap.find()
      .populate('createdBy', 'email profile.name')
      .select('-weeks.topics.resources');
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roadmaps', error: error.message });
  }
});

// Get roadmap by ID
router.get('/:id', async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id)
      .populate('createdBy', 'email profile.name');
    
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roadmap', error: error.message });
  }
});

// Create new roadmap (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const roadmap = new Roadmap({
      ...req.body,
      createdBy: req.user._id
    });

    await roadmap.save();
    res.status(201).json(roadmap);
  } catch (error) {
    res.status(400).json({ message: 'Error creating roadmap', error: error.message });
  }
});

// Update roadmap (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const roadmap = await Roadmap.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    res.json(roadmap);
  } catch (error) {
    res.status(400).json({ message: 'Error updating roadmap', error: error.message });
  }
});

// Delete roadmap (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const roadmap = await Roadmap.findByIdAndDelete(req.params.id);
    
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    res.json({ message: 'Roadmap deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting roadmap', error: error.message });
  }
});

// Get roadmaps by category
router.get('/category/:category', async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ category: req.params.category })
      .populate('createdBy', 'email profile.name')
      .select('-weeks.topics.resources');
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roadmaps', error: error.message });
  }
});

// Get roadmaps by difficulty
router.get('/difficulty/:difficulty', async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ difficulty: req.params.difficulty })
      .populate('createdBy', 'email profile.name')
      .select('-weeks.topics.resources');
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roadmaps', error: error.message });
  }
});

// Mark topic as complete (per user)
router.put('/:id/topics/:weekIndex/:topicIndex/complete', auth, async (req, res) => {
  try {
    const { id, weekIndex, topicIndex } = req.params;
    console.log('COMPLETE: user:', req.user, 'roadmap:', id, 'weekIndex:', weekIndex, 'topicIndex:', topicIndex);
    if (!req.user || !req.user._id || !id) {
      return res.status(400).json({ message: 'Invalid user or roadmap ID' });
    }
    // Find or create user progress for this roadmap
    let userProgress = await UserProgress.findOne({ user: req.user._id, roadmap: id });
    if (!userProgress) {
      userProgress = new UserProgress({ user: req.user._id, roadmap: id, progress: [] });
    }
    // Find or create progress entry for this topic
    let topicProgress = userProgress.progress.find(p => p.weekIndex == weekIndex && p.topicIndex == topicIndex);
    if (!topicProgress) {
      topicProgress = { weekIndex: Number(weekIndex), topicIndex: Number(topicIndex), completed: false, inProgress: false };
      userProgress.progress.push(topicProgress);
    }
    if (!topicProgress.completed) {
      topicProgress.completed = true;
      topicProgress.inProgress = false;
      await userProgress.save();
    }
    // Award XP and update streak
    const user = await User.findById(req.user._id);
    if (!user.profile) user.profile = {};
    user.profile.xp = (user.profile.xp || 0) + 10;
    // Advanced streak logic
    const today = new Date();
    const lastUpdated = user.profile.streakLastUpdated;
    let isConsecutive = false;
    if (lastUpdated) {
      const last = new Date(lastUpdated);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      isConsecutive = last.toDateString() === yesterday.toDateString();
    }
    user.profile.streak = isConsecutive ? (user.profile.streak || 0) + 1 : 1;
    user.profile.streakLongest = Math.max(user.profile.streakLongest || 0, user.profile.streak);
    user.profile.streakLastUpdated = today;
    // Badges
    if (!user.profile.badges) user.profile.badges = [];
    let newBadge = null;
    if (user.profile.xp === 10 && !user.profile.badges.includes('First Completion')) {
      user.profile.badges.push('First Completion');
      newBadge = 'First Completion';
    }
    if (user.profile.streak === 3 && !user.profile.badges.includes('3-Day Streak')) {
      user.profile.badges.push('3-Day Streak');
      newBadge = '3-Day Streak';
    }
    if (user.profile.streak === 7 && !user.profile.badges.includes('7-Day Streak')) {
      user.profile.badges.push('7-Day Streak');
      newBadge = '7-Day Streak';
    }
    // 10 topics completed badge
    const allProgress = await UserProgress.find({ user: req.user._id });
    const totalCompleted = allProgress.reduce((sum, up) => sum + up.progress.filter(p => p.completed).length, 0);
    if (totalCompleted >= 10 && !user.profile.badges.includes('10 Topics Completed')) {
      user.profile.badges.push('10 Topics Completed');
      newBadge = '10 Topics Completed';
    }
    await user.save();
    res.json({ 
      message: 'Topic marked as complete', 
      progress: userProgress, 
      profile: {
        xp: user.profile.xp,
        streak: user.profile.streak,
        streakLongest: user.profile.streakLongest,
        badges: user.profile.badges,
        streakLastUpdated: user.profile.streakLastUpdated
      },
      newBadge,
      confetti: true
    });
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ message: 'Error updating topic', error: error.message, stack: error.stack });
  }
});

// Mark topic as in progress (per user)
router.put('/:id/topics/:weekIndex/:topicIndex/inprogress', auth, async (req, res) => {
  try {
    const { id, weekIndex, topicIndex } = req.params;
    console.log('INPROGRESS: user:', req.user, 'roadmap:', id, 'weekIndex:', weekIndex, 'topicIndex:', topicIndex);
    if (!req.user || !req.user._id || !id) {
      return res.status(400).json({ message: 'Invalid user or roadmap ID' });
    }
    let userProgress = await UserProgress.findOne({ user: req.user._id, roadmap: id });
    if (!userProgress) {
      userProgress = new UserProgress({ user: req.user._id, roadmap: id, progress: [] });
    }
    let topicProgress = userProgress.progress.find(p => p.weekIndex == weekIndex && p.topicIndex == topicIndex);
    if (!topicProgress) {
      topicProgress = { weekIndex: Number(weekIndex), topicIndex: Number(topicIndex), completed: false, inProgress: false };
      userProgress.progress.push(topicProgress);
    }
    topicProgress.inProgress = true;
    topicProgress.completed = false;
    await userProgress.save();
    res.json({ message: 'Topic marked as in progress', progress: userProgress });
  } catch (error) {
    console.error('Error marking topic as in progress:', error);
    res.status(500).json({ message: 'Error marking topic as in progress', error: error.message, stack: error.stack });
  }
});

// Get user progress for a roadmap
router.get('/:id/progress', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userProgress = await UserProgress.findOne({ user: req.user._id, roadmap: id });
    res.json(userProgress || { progress: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress', error: error.message });
  }
});

// Reset topic progress
router.put('/:id/topics/:weekIndex/:topicIndex/reset', auth, async (req, res) => {
  try {
    const { id, weekIndex, topicIndex } = req.params;
    let userProgress = await UserProgress.findOne({ user: req.user._id, roadmap: id });
    
    if (!userProgress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    // Find and update the topic progress
    const topicProgress = userProgress.progress.find(p => p.weekIndex == weekIndex && p.topicIndex == topicIndex);
    if (topicProgress) {
      topicProgress.completed = false;
      topicProgress.inProgress = false;
      await userProgress.save();
    }

    res.json({ message: 'Topic progress has been reset', progress: userProgress });
  } catch (error) {
    console.error('Error resetting topic progress:', error);
    res.status(500).json({ message: 'Error resetting topic progress', error: error.message });
  }
});

module.exports = router; 