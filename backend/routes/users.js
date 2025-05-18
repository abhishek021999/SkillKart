const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    // List all possible profile fields
    const profileFields = [
      'name', 'qualifications', 'experience', 'expertise', 'bio', 'linkedin',
      'interests', 'learningGoals', 'weeklyAvailableTime'
    ];
    const updates = {};
    for (const field of profileFields) {
      if (req.body[field] !== undefined) {
        updates[`profile.${field}`] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      email: user.email,
      role: user.role,
      profile: user.profile || {},
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update XP points
router.put('/xp', auth, async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { 'profile.xpPoints': points } },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating XP', error: error.message });
  }
});

// Add badge
router.post('/badges', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        $push: { 
          'profile.badges': {
            name,
            earnedAt: new Date()
          }
        }
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error adding badge', error: error.message });
  }
});

// Update streak
router.put('/streak', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const today = new Date();
    const lastUpdated = user.profile.streak.lastUpdated;
    
    // Check if last update was yesterday
    const isConsecutive = lastUpdated && 
      new Date(lastUpdated).toDateString() === 
      new Date(today.setDate(today.getDate() - 1)).toDateString();

    const updates = {
      'profile.streak.current': isConsecutive ? user.profile.streak.current + 1 : 1,
      'profile.streak.lastUpdated': today
    };

    // Update longest streak if current streak is longer
    if (updates['profile.streak.current'] > user.profile.streak.longest) {
      updates['profile.streak.longest'] = updates['profile.streak.current'];
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error updating streak', error: error.message });
  }
});

module.exports = router; 