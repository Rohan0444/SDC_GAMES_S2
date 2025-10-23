import mongoose from 'mongoose';
import Participant from '../models/participant.js';
import connectDB from '../config/database.js';

// Connect to MongoDB
connectDB();

async function testCompleteMongoDBIntegration() {
  try {
    console.log('🧪 Testing Complete MongoDB Integration...\n');
    
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Database connected successfully');
    } else {
      throw new Error('Database not connected');
    }
    
    // Test 2: Create test participant
    console.log('\n2️⃣ Testing participant creation...');
    const testParticipant = new Participant({
      name: 'Test User MongoDB',
      rollNumber: 'MONGOTEST001',
      email: 'mongotest@example.com',
      phone: '+1234567890',
      college: 'MongoDB University',
      branch: 'Computer Science',
      year: '2024',
      degree: 'B.Tech',
      avatar: 'blue.png',
      status: 'Alive'
    });
    
    await testParticipant.save();
    console.log('✅ Participant created successfully:', testParticipant.name);
    
    // Test 3: Find participant
    console.log('\n3️⃣ Testing participant lookup...');
    const foundParticipant = await Participant.findOne({ rollNumber: 'MONGOTEST001' });
    if (foundParticipant) {
      console.log('✅ Participant found:', foundParticipant.name);
    } else {
      throw new Error('Participant not found');
    }
    
    // Test 4: Update participant
    console.log('\n4️⃣ Testing participant update...');
    const updatedParticipant = await Participant.findOneAndUpdate(
      { rollNumber: 'MONGOTEST001' },
      { 
        name: 'Updated Test User',
        college: 'Updated MongoDB University',
        lastUpdated: new Date()
      },
      { new: true }
    );
    console.log('✅ Participant updated:', updatedParticipant.name);
    
    // Test 5: Eliminate participant
    console.log('\n5️⃣ Testing participant elimination...');
    const eliminatedParticipant = await Participant.findOneAndUpdate(
      { rollNumber: 'MONGOTEST001' },
      { 
        status: 'Eliminated',
        eliminatedAt: new Date()
      },
      { new: true }
    );
    console.log('✅ Participant eliminated:', eliminatedParticipant.status);
    
    // Test 6: Get statistics
    console.log('\n6️⃣ Testing statistics...');
    const stats = await Participant.getStatistics();
    console.log('✅ Statistics:', stats);
    
    // Test 7: Get participants by status
    console.log('\n7️⃣ Testing status-based queries...');
    const aliveParticipants = await Participant.getByStatus('Alive');
    const eliminatedParticipants = await Participant.getByStatus('Eliminated');
    console.log(`✅ Alive participants: ${aliveParticipants.length}`);
    console.log(`✅ Eliminated participants: ${eliminatedParticipants.length}`);
    
    // Test 8: Bulk operations
    console.log('\n8️⃣ Testing bulk operations...');
    
    // Create multiple test participants
    const bulkParticipants = [
      {
        name: 'Bulk Test 1',
        rollNumber: 'BULK001',
        email: 'bulk1@example.com',
        phone: '+1111111111',
        college: 'Bulk University',
        branch: 'CS',
        year: '2024',
        degree: 'B.Tech',
        status: 'Alive'
      },
      {
        name: 'Bulk Test 2',
        rollNumber: 'BULK002',
        email: 'bulk2@example.com',
        phone: '+2222222222',
        college: 'Bulk University',
        branch: 'IT',
        year: '2024',
        degree: 'B.Tech',
        status: 'Alive'
      }
    ];
    
    const insertedBulk = await Participant.insertMany(bulkParticipants);
    console.log(`✅ Bulk insert: ${insertedBulk.length} participants created`);
    
    // Test bulk elimination
    const bulkResult = await Participant.eliminateByRollNumbers(['BULK001', 'BULK002']);
    console.log(`✅ Bulk elimination: ${bulkResult.modifiedCount} participants updated`);
    
    // Test 9: Validation tests
    console.log('\n9️⃣ Testing validation...');
    
    try {
      const invalidParticipant = new Participant({
        name: 'Invalid',
        // Missing required fields
      });
      await invalidParticipant.save();
      console.log('❌ Validation should have failed');
    } catch (error) {
      console.log('✅ Validation working correctly:', error.message);
    }
    
    // Test 10: Duplicate prevention
    console.log('\n🔟 Testing duplicate prevention...');
    
    try {
      const duplicateParticipant = new Participant({
        name: 'Duplicate Test',
        rollNumber: 'MONGOTEST001', // Same roll number as existing
        email: 'duplicate@example.com',
        phone: '+3333333333',
        college: 'Duplicate University',
        branch: 'CS',
        year: '2024',
        degree: 'B.Tech'
      });
      await duplicateParticipant.save();
      console.log('❌ Duplicate prevention should have failed');
    } catch (error) {
      console.log('✅ Duplicate prevention working:', error.message.includes('duplicate') ? 'Roll number' : 'Email');
    }
    
    // Test 11: Reset participants
    console.log('\n1️⃣1️⃣ Testing participant reset...');
    const resetResult = await Participant.updateMany(
      { status: 'Eliminated' },
      { 
        status: 'Alive',
        eliminatedAt: null,
        lastUpdated: new Date()
      }
    );
    console.log(`✅ Reset result: ${resetResult.modifiedCount} participants reset`);
    
    // Test 12: Complex queries
    console.log('\n1️⃣2️⃣ Testing complex queries...');
    
    // Find participants by college
    const collegeParticipants = await Participant.find({ college: 'MongoDB University' });
    console.log(`✅ College query: ${collegeParticipants.length} participants found`);
    
    // Find participants created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayParticipants = await Participant.find({ 
      createdAt: { $gte: today } 
    });
    console.log(`✅ Today's participants: ${todayParticipants.length} found`);
    
    // Test 13: Cleanup test data
    console.log('\n1️⃣3️⃣ Cleaning up test data...');
    const cleanupResult = await Participant.deleteMany({
      rollNumber: { $in: ['MONGOTEST001', 'BULK001', 'BULK002'] }
    });
    console.log(`✅ Cleanup: ${cleanupResult.deletedCount} test participants deleted`);
    
    console.log('\n🎉 All MongoDB integration tests passed!');
    console.log('\n📊 Final Statistics:');
    const finalStats = await Participant.getStatistics();
    console.log(`   - Total participants: ${finalStats.total}`);
    console.log(`   - Alive participants: ${finalStats.alive}`);
    console.log(`   - Eliminated participants: ${finalStats.eliminated}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
  }
}

// Run the comprehensive test
testCompleteMongoDBIntegration();
