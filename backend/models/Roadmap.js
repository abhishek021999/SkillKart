const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['video', 'article', 'quiz'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: function() {
      // Only require url for non-quiz resources
      return this.type !== 'quiz';
    }
  },
  description: String,
  duration: Number, // in minutes
  quiz: { type: Array, default: undefined } // allow quiz data for quiz type
});

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  resources: [resourceSchema],
  estimatedTime: Number, // in hours
  order: Number,
  inProgress: {
    type: Boolean,
    default: false
  }
});

const weekSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  topics: [topicSchema]
});

const roadmapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  weeks: [weekSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
roadmapSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Roadmap', roadmapSchema); 