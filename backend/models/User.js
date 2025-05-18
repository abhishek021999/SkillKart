const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['learner', 'admin'],
    default: 'learner'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  profile: {
    name: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    qualifications: { type: String, default: '' },
    experience: { type: String, default: '' },
    expertise: { type: String, default: '' },
    bio: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    // learner fields
    interests: { type: [String], default: [] },
    learningGoals: { type: String, default: '' },
    weeklyAvailableTime: { type: Number, default: 0 },
    xp: {
      type: Number,
      default: 0
    },
    badges: [String],
    streak: {
      type: Number,
      default: 0
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 