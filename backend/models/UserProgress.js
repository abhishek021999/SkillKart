const mongoose = require('mongoose');

const topicProgressSchema = new mongoose.Schema({
  weekIndex: Number,
  topicIndex: Number,
  completed: { type: Boolean, default: false },
  inProgress: { type: Boolean, default: false }
}, { _id: false });

const userProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roadmap: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
  progress: [topicProgressSchema]
});

// Create a compound index to ensure a user can only have one progress record per roadmap
userProgressSchema.index({ user: 1, roadmap: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', userProgressSchema); 