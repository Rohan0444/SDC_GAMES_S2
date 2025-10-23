import mongoose from 'mongoose';
import Participant from '../models/participant.js';
import connectDB from '../config/database.js';

// Connect to MongoDB
connectDB();

async function testParticipantSystem() {
  try {
    console.log('🧪 Testing MongoDB Participant System...\n');
    
    // Test 1: Create a test participant
    console.log('1️⃣ Testing participant creation...');
    const testParticipant = new Participant({
      name: 'Test User',
      rollNumber: 'TEST001',
      email: 'test@example.com',
      phone: '+1234567890',
      college: 'Test University',
      branch: 'Computer Science',
      year: '2024',
      degree: 'B.Tech',
      avatar: 'blue.png',
      status: 'Alive'
    });
    
    await testParticipant.save();
    console.log('✅ Participant created successfully:', testParticipant.name);
    
    // Test 2: Find participant by roll number
    console.log('\n2️⃣ Testing participant lookup...');
    const foundParticipant = await Participant.findOne({ rollNumber: 'TEST001' });
    console.log('✅ Participant found:', foundParticipant.name);
    
    // Test 3: Update participant status
    console.log('\n3️⃣ Testing participant elimination...');
    const updatedParticipant = await Participant.findOneAndUpdate(
      { rollNumber: 'TEST001' },
      { 
        status: 'Eliminated',
        eliminatedAt: new Date()
      },
      { new: true }
    );
    console.log('✅ Participant eliminated:', updatedParticipant.status);
    
    // Test 4: Get statistics
    console.log('\n4️⃣ Testing statistics...');
    const stats = await Participant.getStatistics();
    console.log('✅ Statistics:', stats);
    
    // Test 5: Get participants by status
    console.log('\n5️⃣ Testing status-based queries...');
    const aliveParticipants = await Participant.getByStatus('Alive');
    const eliminatedParticipants = await Participant.getByStatus('Eliminated');
    console.log(`✅ Alive participants: ${aliveParticipants.length}`);
    console.log(`✅ Eliminated participants: ${eliminatedParticipants.length}`);
    
    // Test 6: Bulk elimination
    console.log('\n6️⃣ Testing bulk elimination...');
    const result = await Participant.eliminateByRollNumbers(['TEST001']);
    console.log('✅ Bulk elimination result:', result.modifiedCount, 'participants updated');
    
    // Test 7: Reset participants
    console.log('\n7️⃣ Testing participant reset...');
    const resetResult = await Participant.updateMany(
      { status: 'Eliminated' },
      { 
        status: 'Alive',
        eliminatedAt: null
      }
    );
    console.log('✅ Reset result:', resetResult.modifiedCount, 'participants reset');
    
    // Test 8: Clean up test data
    console.log('\n8️⃣ Cleaning up test data...');
    await Participant.deleteOne({ rollNumber: 'TEST001' });
    console.log('✅ Test participant deleted');
    
    console.log('\n🎉 All tests passed! MongoDB Participant System is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
  }
}

// Run the test
testParticipantSystem();
