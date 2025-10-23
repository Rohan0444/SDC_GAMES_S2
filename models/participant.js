import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  college: {
    type: String,
    required: true,
    trim: true
  },
  branch: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    required: true,
    trim: true
  },
  degree: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: 'blue.png'
  },
  status: {
    type: String,
    enum: ['Alive', 'Eliminated'],
    default: 'Alive'
  },
  eliminatedAt: {
    type: Date,
    default: null
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
participantSchema.index({ rollNumber: 1 });
participantSchema.index({ status: 1 });
participantSchema.index({ college: 1 });

// Update lastUpdated before saving
participantSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to get participants by status
participantSchema.statics.getByStatus = function(status) {
  return this.find({ status }).sort({ rollNumber: 1 });
};

// Static method to eliminate participants by roll numbers
participantSchema.statics.eliminateByRollNumbers = async function(rollNumbers) {
  const result = await this.updateMany(
    { rollNumber: { $in: rollNumbers } },
    { 
      status: 'Eliminated',
      eliminatedAt: new Date(),
      lastUpdated: new Date()
    }
  );
  return result;
};

// Static method to get participant statistics
participantSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: 0,
    alive: 0,
    eliminated: 0
  };
  
  stats.forEach(stat => {
    result.total += stat.count;
    if (stat._id === 'Alive') {
      result.alive = stat.count;
    } else if (stat._id === 'Eliminated') {
      result.eliminated = stat.count;
    }
  });
  
  return result;
};

const Participant = mongoose.model('Participant', participantSchema);

export default Participant;
