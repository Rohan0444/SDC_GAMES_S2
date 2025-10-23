import express from 'express';
import { GameSettings, RoundHistory, AdminAction } from '../models/GameModels.js';
import Participant from '../models/participant.js';

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
        roundNumber: 1,
        roundName: 'Mission Alpha',
        roundDetails: 'Complete all tasks to prepare the spaceship for departure. Work together as a team, but beware of impostors among you!',
        preRoundMinutes: 5,
        roundDuration: 5,
        currentTimer: 300,
        nextTimer: 180,
        isActive: false,
        attachments: [],
        links: [],
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

// Get current round data
router.get('/current-round', async (req, res) => {
  try {
    const settings = await GameSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      return res.status(404).json({ error: 'No game settings found' });
    }

    console.log('Current settings:', {
      gameStatus: settings.gameStatus,
      roundStartTime: settings.roundStartTime,
      attachments: settings.attachments,
      roundUrl: settings.roundUrl
    });

    // Calculate remaining time
    let remainingTime = 0;
    let isActive = false;
    
    if (settings.gameStatus === 'active' && settings.roundStartTime) {
      const now = new Date();
      const startTime = new Date(settings.roundStartTime);
      const elapsed = Math.floor((now - startTime) / 1000);
      remainingTime = Math.max(0, settings.currentTimer - elapsed);
      isActive = remainingTime > 0;
      
      console.log('Timer calculation:', {
        now: now.toISOString(),
        startTime: startTime.toISOString(),
        elapsed,
        remainingTime,
        isActive
      });
      
      // If timer reached 0, reset to default state
      if (remainingTime === 0 && settings.currentTimer > 0) {
        settings.gameStatus = 'waiting';
        settings.isActive = false;
        settings.roundStartTime = null;
        await settings.save();
        
        return res.json({
          isActive: false,
          message: "Round is starting soon",
          roundData: null
        });
      }
    }

    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    const responseData = {
      isActive: isActive,
      message: isActive ? "Round Active" : "Round is starting soon",
      roundData: isActive ? {
        roundNumber: settings.roundNumber,
        roundName: settings.roundName,
        roundDetails: settings.roundDetails,
        roundRules: settings.roundRules,
        roundUrl: settings.roundUrl,
        roundLinks: settings.roundLinks || [],
        participationType: settings.participationType,
        attachments: settings.attachments,
        duration: settings.roundDuration,
        remainingTime: remainingTime,
        timerDisplay: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      } : null
    };

    console.log('Sending response:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Error getting current round:', error);
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
      if (remaining === 0 && settings.gameStatus === 'countdown') {
        settings.gameStatus = 'active';
        settings.countdownFinished = true;
        settings.currentRoundStarted = true;
        settings.preGameCountdown.isActive = false;
        settings.roundStartTime = new Date();
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
      
      // Auto-finish round if timer reaches 0
      if (remaining === 0 && settings.currentTimer > 0) {
        settings.gameStatus = 'round_finished';
        settings.isActive = false;
        await settings.save();
        
        // Return finished state
        roundTimer.remainingTime = 0;
        roundTimer.minutes = 0;
        roundTimer.seconds = 0;
        roundTimer.display = '00:00';
        roundTimer.isActive = false;
      }
    }

    res.json({
      // Game settings
      roundNumber: settings.roundNumber,
      roundName: settings.roundName,
      roundDetails: settings.roundDetails,
      preRoundMinutes: settings.preRoundMinutes,
      roundDuration: settings.roundDuration,
      currentTimer: settings.currentTimer,
      nextTimer: settings.nextTimer,
      isActive: settings.isActive,
      attachments: settings.attachments,
      links: settings.links,
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

// Test endpoint to manually set round data for debugging
router.post('/test-round', async (req, res) => {
  try {
    const settings = await GameSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      return res.status(404).json({ error: 'No game settings found' });
    }

    // Set test data
    settings.roundNumber = 1;
    settings.roundName = 'Test Round';
    settings.roundDetails = 'This is a test round to verify attachments and links are working properly.';
    settings.roundUrl = 'https://example.com';
    settings.roundDuration = 5;
    settings.currentTimer = 300; // 5 minutes
    settings.attachments = [
      {
        name: 'Test PDF Document',
        type: 'application/pdf',
        size: 1024,
        url: 'https://example.com/test.pdf',
        isLink: true
      },
      {
        name: 'Instructions.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 2048,
        url: 'https://example.com/instructions.docx',
        isLink: true
      }
    ];
    settings.gameStatus = 'active';
    settings.isActive = true;
    settings.roundStartTime = new Date();
    settings.lastUpdated = new Date();
    
    await settings.save();
    
    res.json({
      message: 'Test round created successfully',
      settings: settings
    });
  } catch (error) {
    console.error('Error creating test round:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start a new round
router.post('/start-round', async (req, res) => {
  try {
    const { roundNumber, roundName, roundDetails, roundRules, roundUrl, roundLinks, participationType, roundDuration, attachments, duration } = req.body;
    
    console.log('Starting round with data:', {
      roundNumber, roundName, roundDetails, roundRules, roundUrl, roundLinks, participationType, roundDuration, attachments, duration
    });
    
    if (!roundName || !roundDetails) {
      return res.status(400).json({ error: 'Round name and description are required' });
    }

    console.log('Looking for GameSettings...');
    const settings = await GameSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      console.log('No GameSettings found, creating new one...');
      const newSettings = new GameSettings({
        roundNumber: roundNumber || 1,
        roundName: roundName,
        roundDetails: roundDetails,
        roundRules: roundRules || 'Follow all instructions carefully. No cheating allowed. Work as a team.',
        roundUrl: roundUrl || '',
        roundLinks: roundLinks || [],
        participationType: participationType || 'individual',
        roundDuration: roundDuration || 5,
        currentTimer: duration || (roundDuration * 60),
        attachments: attachments || [],
        gameStatus: 'active',
        isActive: true,
        roundStartTime: new Date(),
        lastUpdated: new Date()
      });
      
      await newSettings.save();
      console.log('New GameSettings created successfully');
      
      return res.json({
        roundNumber: newSettings.roundNumber,
        roundName: newSettings.roundName,
        roundDetails: newSettings.roundDetails,
        roundRules: newSettings.roundRules,
        roundUrl: newSettings.roundUrl,
        participationType: newSettings.participationType,
        roundDuration: newSettings.roundDuration,
        currentTimer: newSettings.currentTimer,
        gameStatus: newSettings.gameStatus,
        isActive: newSettings.isActive
      });
    }

    console.log('Found existing GameSettings, updating...');
    // Update settings with new round data
    settings.roundNumber = roundNumber || settings.roundNumber + 1;
    settings.roundName = roundName;
    settings.roundDetails = roundDetails;
    settings.roundRules = roundRules || 'Follow all instructions carefully. No cheating allowed. Work as a team.';
    settings.roundUrl = roundUrl || '';
    settings.roundLinks = roundLinks || [];
    settings.participationType = participationType || 'individual';
    settings.roundDuration = roundDuration || 5;
    settings.currentTimer = duration || (roundDuration * 60);
    settings.attachments = attachments || [];
    settings.gameStatus = 'active';
    settings.isActive = true;
    settings.roundStartTime = new Date();
    settings.lastUpdated = new Date();
    
    console.log('Updated settings:', {
      roundNumber: settings.roundNumber,
      roundName: settings.roundName,
      roundUrl: settings.roundUrl,
      attachments: settings.attachments,
      currentTimer: settings.currentTimer
    });
    
    await settings.save();
    
    // Log admin action
    await AdminAction.create({
      action: 'start_round',
      details: `Started round ${settings.roundNumber}: ${roundName}`,
      gameState: settings.toObject()
    });
    
    res.json(settings);
  } catch (error) {
    console.error('Error starting round:', error);
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

// Eliminate participants by roll numbers
router.post('/eliminate-participants', async (req, res) => {
  try {
    const { rollNumbers } = req.body;
    
    if (!rollNumbers || !Array.isArray(rollNumbers) || rollNumbers.length === 0) {
      return res.status(400).json({ error: 'Roll numbers are required' });
    }

    console.log('Eliminating participants with roll numbers:', rollNumbers);
    
    let eliminatedCount = 0;
    const results = [];

    // Update each participant
    for (const rollNumber of rollNumbers) {
      try {
        // Find and update participant by roll number
        const participant = await Participant.findOneAndUpdate(
          { rollNumber: rollNumber.trim() },
          { 
            status: 'Eliminated',
            eliminatedAt: new Date(),
            lastUpdated: new Date()
          },
          { new: true }
        );
        
        if (participant) {
          eliminatedCount++;
          results.push({ 
            rollNumber, 
            status: 'eliminated',
            participantName: participant.name 
          });
          console.log(`Eliminated participant: ${participant.name} (${rollNumber})`);
        } else {
          results.push({ rollNumber, status: 'not_found' });
          console.log(`Participant not found: ${rollNumber}`);
        }
      } catch (error) {
        console.error(`Error eliminating participant ${rollNumber}:`, error);
        results.push({ rollNumber, status: 'error', error: error.message });
      }
    }

    // Log admin action
    await AdminAction.create({
      action: 'eliminate_participants',
      details: `Eliminated ${eliminatedCount} participants: ${rollNumbers.join(', ')}`,
      gameState: { eliminatedRollNumbers: rollNumbers, eliminatedCount }
    });

    res.json({
      success: true,
      eliminatedCount,
      results,
      message: `Successfully eliminated ${eliminatedCount} out of ${rollNumbers.length} participants`
    });
  } catch (error) {
    console.error('Error eliminating participants:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminate participants by team name
router.post('/eliminate-by-team', async (req, res) => {
  try {
    const { teamName } = req.body;
    
    if (!teamName || teamName.trim() === '') {
      return res.status(400).json({ error: 'Team name is required' });
    }

    console.log('Eliminating participants from team:', teamName);
    
    // Find and update all participants in the team
    const result = await Participant.updateMany(
      { 
        team: teamName.trim(),
        status: 'Alive' // Only eliminate alive participants
      },
      { 
        status: 'Eliminated',
        eliminatedAt: new Date(),
        lastUpdated: new Date()
      }
    );

    console.log(`Eliminated ${result.modifiedCount} participants from team "${teamName}"`);

    // Log admin action
    await AdminAction.create({
      action: 'eliminate_by_team',
      details: `Eliminated ${result.modifiedCount} participants from team: ${teamName}`,
      gameState: { teamName, eliminatedCount: result.modifiedCount }
    });

    res.json({
      success: true,
      eliminatedCount: result.modifiedCount,
      teamName: teamName,
      message: `Successfully eliminated ${result.modifiedCount} participants from team "${teamName}"`
    });
  } catch (error) {
    console.error('Error eliminating participants by team:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get participants status
router.get('/participants-status', async (req, res) => {
  try {
    console.log('Fetching participants status...');
    
    const participants = await Participant.find()
      .sort({ rollNumber: 1 })
      .select('name rollNumber status college branch year degree avatar eliminatedAt registeredAt');
    
    console.log(`Found ${participants.length} participants`);
    
    res.json(participants);
  } catch (error) {
    console.error('Error getting participants status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get participant statistics
router.get('/participants-statistics', async (req, res) => {
  try {
    const stats = await Participant.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error getting participant statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get participants by status
router.get('/participants-by-status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!['Alive', 'Eliminated'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "Alive" or "Eliminated"' });
    }
    
    const participants = await Participant.getByStatus(status);
    res.json(participants);
  } catch (error) {
    console.error('Error getting participants by status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new participant
router.post('/add-participant', async (req, res) => {
  try {
    const participantData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'rollNumber', 'email'];
    for (const field of requiredFields) {
      if (!participantData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }
    
    // Check if participant already exists
    const existingParticipant = await Participant.findOne({
      $or: [
        { rollNumber: participantData.rollNumber },
        { email: participantData.email }
      ]
    });
    
    if (existingParticipant) {
      return res.status(400).json({ 
        error: 'Participant already exists with this roll number or email' 
      });
    }
    
    const participant = new Participant(participantData);
    await participant.save();
    
    console.log(`Added new participant: ${participant.name} (${participant.rollNumber})`);
    
    res.json({
      success: true,
      participant,
      message: 'Participant added successfully'
    });
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update participant
router.put('/update-participant/:rollNumber', async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const updateData = req.body;
    
    const participant = await Participant.findOneAndUpdate(
      { rollNumber },
      { ...updateData, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    
    console.log(`Updated participant: ${participant.name} (${rollNumber})`);
    
    res.json({
      success: true,
      participant,
      message: 'Participant updated successfully'
    });
  } catch (error) {
    console.error('Error updating participant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete participant
router.delete('/delete-participant/:rollNumber', async (req, res) => {
  try {
    const { rollNumber } = req.params;
    
    const participant = await Participant.findOneAndDelete({ rollNumber });
    
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    
    console.log(`Deleted participant: ${participant.name} (${rollNumber})`);
    
    res.json({
      success: true,
      message: 'Participant deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting participant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reset all participants status to Alive
router.post('/reset-participants', async (req, res) => {
  try {
    const result = await Participant.updateMany(
      { status: 'Eliminated' },
      { 
        status: 'Alive',
        eliminatedAt: null,
        lastUpdated: new Date()
      }
    );
    
    console.log(`Reset ${result.modifiedCount} participants to Alive status`);
    
    // Log admin action
    await AdminAction.create({
      action: 'reset_participants',
      details: `Reset ${result.modifiedCount} participants to Alive status`,
      gameState: { resetCount: result.modifiedCount }
    });
    
    res.json({
      success: true,
      resetCount: result.modifiedCount,
      message: `Reset ${result.modifiedCount} participants to Alive status`
    });
  } catch (error) {
    console.error('Error resetting participants:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
