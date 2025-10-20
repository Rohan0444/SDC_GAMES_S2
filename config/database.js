import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sdc_games';
    
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create default game settings if they don't exist
    await createDefaultGameSettings();
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const createDefaultGameSettings = async () => {
  try {
    const { GameSettings } = await import('../models/GameModels.js');
    
    const existingSettings = await GameSettings.findOne();
    
    if (!existingSettings) {
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
      console.log('Default game settings created');
    }
  } catch (error) {
    console.error('Error creating default game settings:', error.message);
  }
};

export default connectDB;
