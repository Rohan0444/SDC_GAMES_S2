# MongoDB Participant Management System

This document explains the new MongoDB-based participant management system that replaces Firebase for participant operations.

## 🗄️ Database Schema

### Participant Model (`models/participant.js`)

```javascript
{
  name: String (required),
  rollNumber: String (required, unique),
  email: String (required, unique),
  phone: String (required),
  college: String (required),
  branch: String (required),
  year: String (required),
  degree: String (required),
  avatar: String (default: 'blue.png'),
  status: String (enum: ['Alive', 'Eliminated'], default: 'Alive'),
  eliminatedAt: Date (default: null),
  registeredAt: Date (default: Date.now),
  lastUpdated: Date (default: Date.now),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## 🚀 API Endpoints

### 1. **GET** `/api/participants-status`
- **Description**: Get all participants with their current status
- **Response**: Array of participant objects
- **Example**:
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "rollNumber": "2024001",
    "status": "Alive",
    "college": "ABC University",
    "branch": "Computer Science",
    "year": "2024",
    "degree": "B.Tech",
    "avatar": "blue.png"
  }
]
```

### 2. **POST** `/api/eliminate-participants`
- **Description**: Eliminate participants by roll numbers
- **Body**: `{ "rollNumbers": ["2024001", "2024002"] }`
- **Response**:
```json
{
  "success": true,
  "eliminatedCount": 2,
  "results": [
    { "rollNumber": "2024001", "status": "eliminated", "participantName": "John Doe" },
    { "rollNumber": "2024002", "status": "eliminated", "participantName": "Jane Smith" }
  ],
  "message": "Successfully eliminated 2 out of 2 participants"
}
```

### 3. **GET** `/api/participants-statistics`
- **Description**: Get participant statistics
- **Response**:
```json
{
  "total": 100,
  "alive": 85,
  "eliminated": 15
}
```

### 4. **GET** `/api/participants-by-status/:status`
- **Description**: Get participants by specific status (Alive or Eliminated)
- **Parameters**: `status` (Alive or Eliminated)
- **Response**: Array of participant objects

### 5. **POST** `/api/add-participant`
- **Description**: Add a new participant
- **Body**: Complete participant object
- **Response**:
```json
{
  "success": true,
  "participant": { /* participant object */ },
  "message": "Participant added successfully"
}
```

### 6. **PUT** `/api/update-participant/:rollNumber`
- **Description**: Update an existing participant
- **Parameters**: `rollNumber`
- **Body**: Fields to update
- **Response**:
```json
{
  "success": true,
  "participant": { /* updated participant object */ },
  "message": "Participant updated successfully"
}
```

### 7. **DELETE** `/api/delete-participant/:rollNumber`
- **Description**: Delete a participant
- **Parameters**: `rollNumber`
- **Response**:
```json
{
  "success": true,
  "message": "Participant deleted successfully"
}
```

### 8. **POST** `/api/reset-participants`
- **Description**: Reset all eliminated participants to Alive status
- **Response**:
```json
{
  "success": true,
  "resetCount": 15,
  "message": "Reset 15 participants to Alive status"
}
```

## 🛠️ Setup Instructions

### 1. **Database Connection**
Ensure your MongoDB connection is properly configured in `config/database.js`:
```javascript
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
```

### 2. **Environment Variables**
Make sure you have the MongoDB URI in your `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/sdc_games
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sdc_games
```

### 3. **Seed Sample Data**
Run the seeding script to add sample participants:
```bash
node scripts/seedParticipants.js
```

### 4. **Migration from Firebase** (if needed)
If you have existing Firebase data, use the migration script:
```bash
node scripts/migrateFromFirebase.js
```

## 🔧 Model Methods

### Static Methods

#### `Participant.getByStatus(status)`
- Get participants by status
- **Parameters**: `status` (Alive or Eliminated)
- **Returns**: Array of participants

#### `Participant.eliminateByRollNumbers(rollNumbers)`
- Eliminate multiple participants by roll numbers
- **Parameters**: `rollNumbers` (array of strings)
- **Returns**: MongoDB update result

#### `Participant.getStatistics()`
- Get participant statistics
- **Returns**: Object with total, alive, and eliminated counts

### Instance Methods

#### `participant.save()`
- Save participant to database
- Automatically updates `lastUpdated` field

## 📊 Indexes

The model includes the following indexes for optimal performance:
- `rollNumber` (unique)
- `email` (unique)
- `status`
- `college`

## 🔍 Query Examples

### Find all alive participants
```javascript
const aliveParticipants = await Participant.find({ status: 'Alive' });
```

### Find participants by college
```javascript
const collegeParticipants = await Participant.find({ college: 'ABC University' });
```

### Find eliminated participants from last week
```javascript
const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7);

const recentEliminations = await Participant.find({
  status: 'Eliminated',
  eliminatedAt: { $gte: lastWeek }
});
```

## 🚨 Error Handling

All API endpoints include comprehensive error handling:
- **400**: Bad Request (missing required fields, invalid data)
- **404**: Not Found (participant doesn't exist)
- **500**: Internal Server Error (database errors, validation errors)

## 📝 Logging

All operations are logged to the console for debugging:
- Participant creation/updates
- Elimination operations
- Error messages with details

## 🔄 Migration Benefits

### From Firebase to MongoDB:
1. **Better Performance**: Direct database queries instead of API calls
2. **Cost Effective**: No Firebase usage costs
3. **Better Integration**: Native MongoDB integration with Mongoose
4. **Advanced Queries**: Support for complex aggregation queries
5. **Data Consistency**: ACID transactions support
6. **Better Indexing**: Optimized database indexes

## 🧪 Testing

### Test the API endpoints:
```bash
# Get all participants
curl http://localhost:5000/api/participants-status

# Get statistics
curl http://localhost:5000/api/participants-statistics

# Eliminate participants
curl -X POST http://localhost:5000/api/eliminate-participants \
  -H "Content-Type: application/json" \
  -d '{"rollNumbers": ["2024001", "2024002"]}'

# Reset participants
curl -X POST http://localhost:5000/api/reset-participants
```

## 🔧 Troubleshooting

### Common Issues:

1. **Connection Error**: Check MongoDB URI and ensure MongoDB is running
2. **Validation Error**: Ensure all required fields are provided
3. **Duplicate Error**: Check for existing roll numbers or emails
4. **Permission Error**: Ensure database user has read/write permissions

### Debug Mode:
Enable detailed logging by setting:
```javascript
mongoose.set('debug', true);
```

This will log all MongoDB queries to the console.
