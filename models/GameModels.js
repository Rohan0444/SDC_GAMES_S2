import mongoose from 'mongoose';

// Game Settings Schema
const gameSettingsSchema = new mongoose.Schema({
  roundName: {
    type: String,
    default: 'Mission Alpha',
    required: true
  },
  roundDetails: {
    type: String,
    default: 'Complete all tasks to prepare the spaceship for departure. Work together as a team, but beware of impostors among you!',
    required: true
  },
  currentTimer: {
    type: Number,
    default: 300, // 5 minutes in seconds
    required: true
  },
  nextTimer: {
    type: Number,
    default: 180, // 3 minutes in seconds
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    isLink: {
      type: Boolean,
      default: false
    }
  }],
  preGameCountdown: {
    days: {
      type: Number,
      default: 0
    },
    hours: {
      type: Number,
      default: 0
    },
    minutes: {
      type: Number,
      default: 0
    },
    seconds: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: false
    },
    isPaused: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: Date
    },
    originalDuration: {
      type: Number // Total seconds when countdown started
    }
  },
  nextRound: {
    name: {
      type: String,
      default: 'Mission Beta'
    },
    details: {
      type: String,
      default: 'New challenges await! Complete the reactor tasks and identify the impostor before time runs out.'
    },
    attachments: [{
      name: String,
      url: String,
      type: String,
      size: Number,
      isLink: {
        type: Boolean,
        default: false
      }
    }],
    timer: {
      type: Number,
      default: 300 // 5 minutes for next round
    }
  },
  currentRound: {
    type: Number,
    default: 1
  },
  totalRounds: {
    type: Number,
    default: 4
  },
  gameStatus: {
    type: String,
    enum: ['waiting', 'countdown', 'countdown_finished', 'active', 'paused', 'ended'],
    default: 'waiting'
  },
  countdownFinished: {
    type: Boolean,
    default: false
  },
  currentRoundStarted: {
    type: Boolean,
    default: false
  },
  roundStartTime: {
    type: Date
  },
  cooldownEndTime: {
    type: Date
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Round History Schema
const roundHistorySchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: true
  },
  roundName: {
    type: String,
    required: true
  },
  roundDetails: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    isLink: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['completed', 'incomplete', 'cancelled'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Admin Actions Schema
const adminActionSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['start_countdown', 'pause_countdown', 'reset_countdown', 'start_game', 'pause_game', 'reset_game', 'start_next_round', 'emergency_meeting', 'sabotage', 'eliminate_player', 'reveal_impostor', 'end_game', 'set_timers', 'set_countdown', 'update_settings', 'update_round_info', 'update_next_round']
  },
  details: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  gameState: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Create models
const GameSettings = mongoose.model('GameSettings', gameSettingsSchema);
const RoundHistory = mongoose.model('RoundHistory', roundHistorySchema);
const AdminAction = mongoose.model('AdminAction', adminActionSchema);

export { GameSettings, RoundHistory, AdminAction };
