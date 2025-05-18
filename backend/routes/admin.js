const express = require('express');
const router = express.Router();
const Roadmap = require('../models/Roadmap');
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const Article = require('../models/Article');

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all roadmaps (admin view)
router.get('/roadmaps', adminAuth, async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ createdBy: req.user._id })
      .populate('createdBy', 'email profile.name');
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roadmaps', error: error.message });
  }
});

// Create new roadmap
router.post('/roadmaps', adminAuth, async (req, res) => {
  try {
    console.log('Received request body:', req.body); // Debug log
    const { title, description, duration, category, difficulty, weeks } = req.body;

    // Convert duration to number if it's a string
    const numDuration = parseInt(duration, 10);
    console.log('Parsed duration:', numDuration);
    console.log('Weeks data:', weeks);
    
    // Validate required fields
    if (!title || !category || !numDuration) {
      console.log('Validation failed:', {
        title: !!title,
        category: !!category,
        duration: numDuration
      });
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['title', 'category', 'duration'],
        received: { title, category, duration: numDuration }
      });
    }

    const roadmap = new Roadmap({
      title: title.trim(),
      description: description?.trim() || '',
      duration: numDuration,
      category: category.trim(),
      difficulty: difficulty?.trim() || 'beginner',
      createdBy: req.user._id,
      weeks: weeks || Array(numDuration).fill().map((_, index) => ({
        weekNumber: index + 1,
        title: `Week ${index + 1}`,
        description: `Content for Week ${index + 1}`,
        topics: []
      }))
    });

    console.log('Created roadmap object:', roadmap);
    await roadmap.save();
    res.status(201).json(roadmap);
  } catch (error) {
    console.error('Roadmap creation error:', error); // Debug log
    res.status(400).json({ 
      message: 'Error creating roadmap', 
      error: error.message,
      details: error.errors
    });
  }
});

// Add topic to week
router.post('/roadmaps/:roadmapId/weeks/:weekIndex/topics', adminAuth, async (req, res) => {
  try {
    const { roadmapId, weekIndex } = req.params;
    const { title, resources } = req.body;

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    if (!roadmap.weeks[weekIndex]) {
      return res.status(404).json({ message: 'Week not found' });
    }

    roadmap.weeks[weekIndex].topics.push({
      title,
      resources: resources || [],
      completed: false
    });

    await roadmap.save();
    res.status(201).json(roadmap);
  } catch (error) {
    res.status(400).json({ message: 'Error adding topic', error: error.message });
  }
});

// Update topic
router.put('/roadmaps/:roadmapId/weeks/:weekIndex/topics/:topicIndex', adminAuth, async (req, res) => {
  try {
    const { roadmapId, weekIndex, topicIndex } = req.params;
    const { title, resources } = req.body;

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    if (!roadmap.weeks[weekIndex] || !roadmap.weeks[weekIndex].topics[topicIndex]) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const topic = roadmap.weeks[weekIndex].topics[topicIndex];
    topic.title = title || topic.title;
    topic.resources = resources || topic.resources;

    await roadmap.save();
    res.json(roadmap);
  } catch (error) {
    res.status(400).json({ message: 'Error updating topic', error: error.message });
  }
});

// Delete topic
router.delete('/roadmaps/:roadmapId/weeks/:weekIndex/topics/:topicIndex', adminAuth, async (req, res) => {
  try {
    const { roadmapId, weekIndex, topicIndex } = req.params;

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    if (!roadmap.weeks[weekIndex] || !roadmap.weeks[weekIndex].topics[topicIndex]) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    roadmap.weeks[weekIndex].topics.splice(topicIndex, 1);
    await roadmap.save();

    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting topic', error: error.message });
  }
});

// Add resource to topic
router.post('/roadmaps/:roadmapId/weeks/:weekIndex/topics/:topicIndex/resources', adminAuth, async (req, res) => {
  try {
    const { roadmapId, weekIndex, topicIndex } = req.params;
    const { type, url, description } = req.body;

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    if (!roadmap.weeks[weekIndex] || !roadmap.weeks[weekIndex].topics[topicIndex]) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    roadmap.weeks[weekIndex].topics[topicIndex].resources.push({
      type,
      url,
      description
    });

    await roadmap.save();
    res.status(201).json(roadmap);
  } catch (error) {
    res.status(400).json({ message: 'Error adding resource', error: error.message });
  }
});

// Get admin dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    // Only count roadmaps created by this admin
    const adminRoadmaps = await Roadmap.find({ createdBy: req.user._id });
    const activeRoadmaps = adminRoadmaps.length;

    // Get all user progress for this admin's roadmaps
    let totalUsers = 0;
    let totalCompletions = 0;
    let totalProgress = 0;
    let progressCount = 0;

    for (const roadmap of adminRoadmaps) {
      const userProgress = await UserProgress.find({ roadmapId: roadmap._id });
      if (userProgress.length > 0) totalUsers += userProgress.length;
      userProgress.forEach(progress => {
        if (progress.percentage === 100) {
          totalCompletions++;
        }
        totalProgress += progress.percentage;
        progressCount++;
      });
    }

    const averageProgress = progressCount > 0 ? Math.round(totalProgress / progressCount) : 0;

    res.json({
      totalUsers,
      activeRoadmaps,
      totalCompletions,
      averageProgress
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// Get user progress for a specific roadmap
router.get('/roadmaps/:roadmapId/progress', adminAuth, async (req, res) => {
  try {
    const { roadmapId } = req.params;
    
    const userProgress = await UserProgress.find({ roadmapId })
      .populate('userId', 'email profile.name profile.interests profile.learningGoals')
      .sort({ lastActivity: -1 });

    const formattedProgress = userProgress.map(progress => ({
      userId: progress.userId._id,
      userEmail: progress.userId.email,
      userName: progress.userId.profile?.name || 'Anonymous',
      userInterests: progress.userId.profile?.interests || [],
      userGoals: progress.userId.profile?.learningGoals || [],
      percentage: progress.percentage,
      completedTopics: progress.completedTopics,
      lastActivity: progress.lastActivity,
      status: progress.status,
      startedAt: progress.createdAt
    }));

    res.json(formattedProgress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user progress', error: error.message });
  }
});

// Update an existing roadmap
router.put('/roadmaps/:roadmapId', adminAuth, async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const updateData = req.body;

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    if (roadmap.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this roadmap' });
    }

    const updatedRoadmap = await Roadmap.findByIdAndUpdate(roadmapId, updateData, { new: true, runValidators: true });
    if (!updatedRoadmap) {
      return res.status(400).json({ message: 'Error updating roadmap' });
    }
    res.json(updatedRoadmap);
  } catch (error) {
    res.status(400).json({ message: 'Error updating roadmap', error: error.message });
  }
});

// Delete an entire roadmap
router.delete('/roadmaps/:roadmapId', adminAuth, async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    if (roadmap.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this roadmap' });
    }

    // Remove all user progress for this roadmap
    await UserProgress.deleteMany({ roadmapId });
    await Roadmap.findByIdAndDelete(roadmapId);
    res.json({ message: 'Roadmap and associated user progress deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting roadmap', error: error.message });
  }
});

// Get user count for a specific roadmap
router.get('/roadmaps/:roadmapId/usercount', adminAuth, async (req, res) => {
  const { roadmapId } = req.params;
  const userCount = await UserProgress.countDocuments({ roadmapId });
  res.json({ userCount });
});

// File upload endpoint (Cloudinary)
router.post('/resources/upload', adminAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  try {
    let resourceType = 'auto';
    if (req.file.mimetype === 'application/pdf') {
      resourceType = 'raw'; // PDFs must be uploaded as raw
    } else if (req.file.mimetype.startsWith('video/')) {
      resourceType = 'video'; // Videos must be uploaded as video
    }
    // Always upload as public resource (type: 'upload', access_mode: 'public')
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: resourceType,
      folder: 'skillkart_resources',
      type: 'upload', // ensure public
      access_mode: 'public' // ensure public (Cloudinary supports this param)
    });
    // Delete local file after upload
    const fs = require('fs');
    fs.unlinkSync(req.file.path);
    res.json({ fileUrl: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: 'Cloudinary upload failed', error: err.message });
  }
});

// Create new article
router.post('/articles', adminAuth, async (req, res) => {
  try {
    const { title, tags, readingTime, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }
    const article = new Article({
      title: title.trim(),
      tags: Array.isArray(tags) ? tags : [],
      readingTime: readingTime || 5,
      content,
      createdBy: req.user._id
    });
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: 'Error saving article', error: error.message });
  }
});

module.exports = router; 