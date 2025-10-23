import mongoose from 'mongoose';
import Participant from './models/participant.js';
import connectDB from './config/database.js';

// Connect to MongoDB
connectDB();

// Sample participants data for testing
const sampleParticipants = [
  {
    name: 'John Doe',
    rollNumber: '2024001',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    college: 'ABC University',
    branch: 'Computer Science',
    year: '2024',
    degree: 'B.Tech',
    avatar: 'blue.png',
    status: 'Alive'
  },
  {
    name: 'Jane Smith',
    rollNumber: '2024002',
    email: 'jane.smith@example.com',
    phone: '+1234567891',
    college: 'XYZ College',
    branch: 'Information Technology',
    year: '2024',
    degree: 'B.Tech',
    avatar: 'red.png',
    status: 'Alive'
  },
  {
    name: 'Mike Johnson',
    rollNumber: '2024003',
    email: 'mike.johnson@example.com',
    phone: '+1234567892',
    college: 'DEF Institute',
    branch: 'Electronics',
    year: '2024',
    degree: 'B.Tech',
    avatar: 'green.png',
    status: 'Alive'
  },
  {
    name: 'Sarah Wilson',
    rollNumber: '2024004',
    email: 'sarah.wilson@example.com',
    phone: '+1234567893',
    college: 'GHI University',
    branch: 'Mechanical',
    year: '2024',
    degree: 'B.Tech',
    avatar: 'yellow.png',
    status: 'Alive'
  },
  {
    name: 'David Brown',
    rollNumber: '2024005',
    email: 'david.brown@example.com',
    phone: '+1234567894',
    college: 'JKL College',
    branch: 'Civil',
    year: '2024',
    degree: 'B.Tech',
    avatar: 'purple.png',
    status: 'Alive'
  },
  {
    name: 'Emily Davis',
    rollNumber: '2024006',
    email: 'emily.davis@example.com',
    phone: '+1234567895',
    college: 'MNO University',
    branch: 'Computer Science',
    year: '2024',
    degree: 'B.Tech',
    avatar: 'cyan.png',
    status: 'Alive'
  },
  {
    name: 'Alex Miller',
    rollNumber: '2024007',
    email: 'alex.miller@example.com',
    phone: '+1234567896',
    college: 'PQR Institute',
    branch: 'Information Technology',
    year: '2024',
    degree: 'B.Tech',
    avatar: 'orange.png',
    status: 'Alive'
  },
  {
    name: 'Lisa Garcia',
    rollNumber: '2024008',
    email: 'lisa.garcia@example.com',
    phone: '+1234567897',
    college: 'STU College',
    branch: 'Electronics',
    year: '2024',
    degree: 'B.Tech',
    avatar: 'pink.png',
    status: 'Alive'
  }
];

async function seedParticipants() {
  try {
    console.log('Starting participant seeding...');
    
    // Clear existing participants (optional - remove this if you want to keep existing data)
    // await Participant.deleteMany({});
    // console.log('Cleared existing participants');
    
    // Check if participants already exist
    const existingCount = await Participant.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing participants. Skipping seeding.`);
      return;
    }
    
    // Insert sample participants
    const insertedParticipants = await Participant.insertMany(sampleParticipants);
    console.log(`Successfully seeded ${insertedParticipants.length} participants`);
    
    // Display statistics
    const stats = await Participant.getStatistics();
    console.log('Participant Statistics:', stats);
    
  } catch (error) {
    console.error('Error seeding participants:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedParticipants();
