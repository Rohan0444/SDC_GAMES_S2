import express from 'express';
import { GameSettings, RoundHistory, AdminAction } from '../models/GameModels.js';

const router = express.Router();

// Get current game settings
router.get('/game-settings', async (req, res) => {
  try {
    console.log('Fetching game settings...');
    const settings = await GameSettings.findOne().sort({ createdAt: -1 });
    if (!settings) {
      console.log('No game settings found, creating default...');
      // Create default settings if none exist
      const defaultSettings = new GameSettings({
        roundName: 'Mission Alpha',
        roundDetails: 'Complete all tasks to prepare the spaceship for departure. Work together as a team, but beware of impostors among you!',
        currentTimer: 300,
        nextTimer: 180,
        isActive: false,
        attachments: [],
        preGameCountdown: {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isActive: false,
          isPaused: false
        },
        nextRound: {
          name: 'Mission Beta',
          details: 'New challenges await! Complete the reactor tasks and identify the impostor before time runs out.',
          attachments: []
        },
        currentRound: 1,
        totalRounds: 4,
        gameStatus: 'waiting'
      });
      await defaultSettings.save();
      return res.json(defaultSettings);
    }
    console.log('Game settings found:', settings.roundName);
    res.json(settings);
  } catch (error) {
    console.error('Error in /game-settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update game settings
router.put('/game-settings', async (req, res) => {
  try {
    const settings = await GameSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      return res.status(404).json({ error: 'No game settings found' });
    }

    // Update settings with new data
    Object.assign(settings, req.body);
    settings.lastUpdated = new Date();
    
    await settings.save();
    
    // Log admin action
    await AdminAction.create({
      action: 'update_settings',
      details: 'Game settings updated',
      gameState: settings.toObject()
    });
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update round information
router.put('/round-info', async (req, res) => {
  try {
    const settings = await GameSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      return res.status(404).json({ error: 'No game settings found' });
    }

    const { roundName, roundDetails, attachments } = req.body;
    
    settings.roundName = roundName;
    settings.roundDetails = roundDetails;
    settings.attachments = attachments || [];
    settings.lastUpdated = new Date();
    
    await settings.save();
    
    // Log admin action
    await AdminAction.create({
      action: 'update_round_info',
      details: `Round updated: ${roundName}`,
      gameState: settings.toObject()
    });
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update next round information
router.put('/next-round', async (req, res) => {
  try {
    const settings = await GameSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      return res.status(404).json({ error: 'No game settings found' });
    }

    const { name, details, attachments } = req.body;
    
    settings.nextRound.name = name;
    settings.nextRound.details = details;
    settings.nextRound.attachments = attachments || [];
    settings.lastUpdated = new Date();
    
    await settings.save();
    
    // Log admin action
    await AdminAction.create({
      action: 'update_next_round',
      details: `Next round updated: ${name}`,
      gameState: settings.toObject()
    });
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set timers
router.put('/timers', async (req, res) => {
  try {
    console.log('Setting timers:', req.body);
    const settings = await GameSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      console.log('No game settings found for timers');
      return res.status(404).json({ error: 'No game settings found' });
    }

    const { currentTimer, nextTimer } = req.body;
    
    settings.currentTimer = currentTimer;
    settings.nextTimer = nextTimer;
    settings.roundStartTime = new Date(); // Set round start time when timer is set
    settings.lastUpdated = new Date();
    
    await settings.save();
    
    console.log('Timers updated successfully');
    
    // Log admin action
    await AdminAction.create({
      action: 'set_timers',
      details: `Timers set: ${currentTimer}s current, ${nextTimer}s next`,
      gameState: settings.toObject()
    });
    
    res.json(settings);
  } catch (error) {
    console.error('Error in /timers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Set pre-game countdown
router.put('/countdown', async (req, res) => {
  try {
    console.log('Setting countdown:', req.body);
    const settings = await GameSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      console.log('No game settings found for countdown');
      return res.status(404).json({ error: 'No game settings found' });
    }

    const { days, hours, minutes, seconds, isActive, isPaused } = req.body;
    
    settings.preGameCountdown.days = days;
    settings.preGameCountdown.hours = hours;
    settings.preGameCountdown.minutes = minutes;
    settings.preGameCountdown.seconds = seconds;
    settings.preGameCountdown.isActive = isActive;
    settings.preGameCountdown.isPaused = isPaused;
    
    // Set start time and original duration when countdown starts
    if (isActive && !settings.preGameCountdown.startTime) {
      settings.preGameCountdown.startTime = new Date();
      settings.preGameCountdown.originalDuration = (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
    }
    
    settings.lastUpdated = new Date();
    
    await settings.save();
    
    console.log('Countdown updated successfully');
    
    // Log admin action
    await AdminAction.create({
      action: 'set_countdown',
      details: `Countdown set: ${days}:${hours}:${minutes}:${seconds}`,
      gameState: settings.toObject()
    });
    
    res.json(settings);
  } catch (error) {
    console.error('Error in /countdown:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start next round
router.post('/start-next-round', async (req, res) => {
  try {
    const settings = await GameSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      return res.status(404).json({ error: 'No game settings found' });
    }

    // Save current round to history
    await RoundHistory.create({
      roundNumber: settings.currentRound,
      roundName: settings.roundName,
      roundDetails: settings.roundDetails,
      duration: settings.currentTimer,
      startTime: new Date(Date.now() - (settings.currentTimer * 1000)),
      endTime: new Date(),
      attachments: settings.attachments,
      status: 'completed'
    });

    // Move next round to current round
    settings.roundName = settings.nextRound.name;
    settings.roundDetails = settings.nextRound.details;
    settings.attachments = [...settings.nextRound.attachments];
    settings.currentRound += 1;
    
    // Reset next round
    settings.nextRound.name = 'Mission Beta';
    settings.nextRound.details = 'New challenges await! Complete the reactor tasks and identify the impostor before time runs out.';
    settings.nextRound.attachments = [];
    settings.lastUpdated = new Date();
    
    await settings.save();
    
    // Log admin action
    await AdminAction.create({
      action: 'start_next_round',
      details: `Started round ${settings.currentRound}: ${settings.roundName}`,
      gameState: settings.toObject()
    });
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Game control actions
router.post('/game-action', async (req, res) => {
  try {
    const settings = await GameSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      return res.status(404).json({ error: 'No game settings found' });
    }

    const { action, details } = req.body;
    
    // Update game state based on action
    switch (action) {
      case 'start_game':
        settings.isActive = true;
        settings.gameStatus = 'active';
        settings.roundStartTime = new Date();
        break;
      case 'pause_game':
        settings.isActive = false;
        settings.gameStatus = 'paused';
        break;
      case 'reset_game':
        settings.isActive = false;
        settings.gameStatus = 'waiting';
        settings.currentRound = 1;
        settings.roundStartTime = null;
        settings.cooldownEndTime = null;
        break;
      case 'end_game':
        // Fully reset state so admin can start over cleanly
        settings.isActive = false;
        settings.gameStatus = 'waiting';
        settings.currentRound = 1;
        settings.roundName = 'Mission Alpha';
        settings.roundDetails = 'Complete all tasks to prepare the spaceship for departure. Work together as a team, but beware of impostors among you!';
        settings.attachments = [];
        settings.currentTimer = 300;
        settings.nextTimer = 180;
        settings.preGameCountdown = {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isActive: false,
          isPaused: false,
          startTime: undefined,
          originalDuration: undefined
        };
        settings.nextRound = {
          name: 'Mission Beta',
          details: 'New challenges await! Complete the reactor tasks and identify the impostor before time runs out.',
          attachments: [],
          timer: 300
        };
        settings.roundStartTime = null;
        settings.cooldownEndTime = null;
        settings.countdownFinished = false;
        settings.currentRoundStarted = false;
        break;
    }
    
    settings.lastUpdated = new Date();
    await settings.save();
    
    // Log admin action
    await AdminAction.create({
      action: action,
      details: details || `Game action: ${action}`,
      gameState: settings.toObject()
    });
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get round history
router.get('/round-history', async (req, res) => {
  try {
    const history = await RoundHistory.find().sort({ createdAt: -1 }).limit(20);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get admin actions log
router.get('/admin-actions', async (req, res) => {
  try {
    const actions = await AdminAction.find().sort({ timestamp: -1 }).limit(50);
    res.json(actions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get countdown status with calculated remaining time
router.get('/countdown-status', async (req, res) => {
  try {
    const settings = await GameSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      return res.status(404).json({ error: 'No game settings found' });
    }

    const countdown = settings.preGameCountdown;
    
    if (countdown.isActive && countdown.startTime && !countdown.isPaused) {
      // Calculate remaining time based on start time
      const now = new Date();
      const elapsed = Math.floor((now - countdown.startTime) / 1000);
      const remaining = Math.max(0, countdown.originalDuration - elapsed);
      
      // Convert remaining seconds to days, hours, minutes, seconds
      const days = Math.floor(remaining / (24 * 60 * 60));
      const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((remaining % (60 * 60)) / 60);
      const seconds = remaining % 60;
      
      res.json({
        days,
        hours,
        minutes,
        seconds,
        isActive: countdown.isActive,
        isPaused: countdown.isPaused,
        remaining: remaining,
        finished: remaining === 0
      });
    } else {
      res.json({
        days: countdown.days,
        hours: countdown.hours,
        minutes: countdown.minutes,
        seconds: countdown.seconds,
        isActive: countdown.isActive,
        isPaused: countdown.isPaused,
        remaining: 0,
        finished: false
      });
    }
  } catch (error) {
    console.error('Error getting countdown status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get real-time timer status
router.get('/timer-status', async (req, res) => {
  try {
    const settings = await GameSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      return res.status(404).json({ error: 'No game settings found' });
    }

    let remainingTime = 0;
    let isRoundActive = false;
    
    if (settings.gameStatus === 'active' && settings.roundStartTime) {
      const now = new Date();
      const startTime = new Date(settings.roundStartTime);
      const elapsed = Math.floor((now - startTime) / 1000);
      remainingTime = Math.max(0, settings.currentTimer - elapsed);
      isRoundActive = true;
      
      // If timer reached 0, automatically move to next round or end
      if (remainingTime === 0 && settings.currentTimer > 0) {
        // Auto-advance to next round
        settings.currentTimer = settings.nextTimer;
        settings.roundStartTime = new Date();
        settings.currentRound += 1;
        await settings.save();
        
        // Return updated timer
        remainingTime = settings.nextTimer;
      }
    } else {
      remainingTime = settings.currentTimer;
    }

    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    res.json({
      remainingTime,
      minutes,
      seconds,
      display: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      gameStatus: settings.gameStatus,
      isActive: settings.isActive,
      isRoundActive: isRoundActive,
      roundStartTime: settings.roundStartTime,
      cooldownEndTime: settings.cooldownEndTime,
      currentRound: settings.currentRound,
      roundName: settings.roundName,
      roundDetails: settings.roundDetails,
      attachments: settings.attachments
    });
  } catch (error) {
    console.error('Error getting timer status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get comprehensive real-time game state
router.get('/game-state', async (req, res) => {
  try {
    const settings = await GameSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      return res.status(404).json({ error: 'No game settings found' });
    }

    // Calculate countdown status
    let countdownStatus = {
      days: settings.preGameCountdown.days,
      hours: settings.preGameCountdown.hours,
      minutes: settings.preGameCountdown.minutes,
      seconds: settings.preGameCountdown.seconds,
      isActive: settings.preGameCountdown.isActive,
      isPaused: settings.preGameCountdown.isPaused,
      finished: false
    };

    if (settings.preGameCountdown.isActive && settings.preGameCountdown.startTime && !settings.preGameCountdown.isPaused) {
      const now = new Date();
      const elapsed = Math.floor((now - settings.preGameCountdown.startTime) / 1000);
      const remaining = Math.max(0, settings.preGameCountdown.originalDuration - elapsed);
      
      countdownStatus.days = Math.floor(remaining / (24 * 60 * 60));
      countdownStatus.hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
      countdownStatus.minutes = Math.floor((remaining % (60 * 60)) / 60);
      countdownStatus.seconds = remaining % 60;
      countdownStatus.finished = remaining === 0;
      
      // Auto-transition when countdown finishes
      if (remaining === 0 && settings.gameStatus !== 'countdown_finished') {
        settings.gameStatus = 'countdown_finished';
        settings.countdownFinished = true;
        settings.preGameCountdown.isActive = false;
        await settings.save();
      }
    }

    // Calculate round timer
    let roundTimer = {
      remainingTime: settings.currentTimer,
      minutes: Math.floor(settings.currentTimer / 60),
      seconds: settings.currentTimer % 60,
      display: `${Math.floor(settings.currentTimer / 60).toString().padStart(2, '0')}:${(settings.currentTimer % 60).toString().padStart(2, '0')}`,
      isActive: false
    };

    if (settings.gameStatus === 'active' && settings.roundStartTime) {
      const now = new Date();
      const startTime = new Date(settings.roundStartTime);
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, settings.currentTimer - elapsed);
      
      roundTimer.remainingTime = remaining;
      roundTimer.minutes = Math.floor(remaining / 60);
      roundTimer.seconds = remaining % 60;
      roundTimer.display = `${Math.floor(remaining / 60).toString().padStart(2, '0')}:${(remaining % 60).toString().padStart(2, '0')}`;
      roundTimer.isActive = true;
      
      // Auto-advance to next round if timer reaches 0
      if (remaining === 0 && settings.currentTimer > 0) {
        settings.currentTimer = settings.nextTimer;
        settings.roundStartTime = new Date();
        settings.currentRound += 1;
        await settings.save();
        
        // Return updated timer
        roundTimer.remainingTime = settings.nextTimer;
        roundTimer.minutes = Math.floor(settings.nextTimer / 60);
        roundTimer.seconds = settings.nextTimer % 60;
        roundTimer.display = `${Math.floor(settings.nextTimer / 60).toString().padStart(2, '0')}:${(settings.nextTimer % 60).toString().padStart(2, '0')}`;
      }
    }

    res.json({
      // Game settings
      roundName: settings.roundName,
      roundDetails: settings.roundDetails,
      currentTimer: settings.currentTimer,
      nextTimer: settings.nextTimer,
      isActive: settings.isActive,
      attachments: settings.attachments,
      currentRound: settings.currentRound,
      totalRounds: settings.totalRounds,
      gameStatus: settings.gameStatus,
      countdownFinished: settings.countdownFinished,
      currentRoundStarted: settings.currentRoundStarted,
      roundStartTime: settings.roundStartTime,
      cooldownEndTime: settings.cooldownEndTime,
      
      // Next round
      nextRound: settings.nextRound,
      
      // Pre-game countdown
      preGameCountdown: settings.preGameCountdown,
      
      // Calculated status
      countdownStatus,
      roundTimer,
      
      // Timestamps
      lastUpdated: settings.lastUpdated
    });
  } catch (error) {
    console.error('Error getting game state:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update current round settings
router.put('/update-current-round', async (req, res) => {
  try {
    const settings = await GameSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      return res.status(404).json({ error: 'No game settings found' });
    }

    const { roundName, roundDetails, currentTimer, attachments } = req.body;
    
    settings.roundName = roundName || settings.roundName;
    settings.roundDetails = roundDetails || settings.roundDetails;
    settings.currentTimer = currentTimer || settings.currentTimer;
    settings.attachments = attachments || settings.attachments;
    settings.lastUpdated = new Date();
    
    // Reset round start time if timer changed
    if (currentTimer && currentTimer !== settings.currentTimer) {
      settings.roundStartTime = new Date();
    }
    
    await settings.save();
    
    // Log admin action
    await AdminAction.create({
      action: 'update_current_round',
      details: `Current round updated: ${settings.roundName}`,
      gameState: settings.toObject()
    });
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start next round early
router.post('/start-next-round-early', async (req, res) => {
  try {
    const settings = await GameSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      return res.status(404).json({ error: 'No game settings found' });
    }

    // Save current round to history
    await RoundHistory.create({
      roundNumber: settings.currentRound,
      roundName: settings.roundName,
      roundDetails: settings.roundDetails,
      duration: settings.currentTimer,
      startTime: settings.roundStartTime ? new Date(settings.roundStartTime) : new Date(),
      endTime: new Date(),
      attachments: settings.attachments,
      status: 'completed'
    });

    // Move next round to current round
    settings.roundName = settings.nextRound.name;
    settings.roundDetails = settings.nextRound.details;
    settings.attachments = [...settings.nextRound.attachments];
    settings.currentTimer = settings.nextRound.timer || settings.nextTimer;
    settings.currentRound += 1;
    settings.roundStartTime = new Date();
    
    // Reset next round
    settings.nextRound.name = 'Mission Beta';
    settings.nextRound.details = 'New challenges await! Complete the reactor tasks and identify the impostor before time runs out.';
    settings.nextRound.attachments = [];
    settings.nextRound.timer = 300;
    settings.lastUpdated = new Date();
    
    await settings.save();
    
    // Log admin action
    await AdminAction.create({
      action: 'start_next_round_early',
      details: `Started round ${settings.currentRound} early: ${settings.roundName}`,
      gameState: settings.toObject()
    });
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
