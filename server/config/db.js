// MongoDB Connection Manager via Mongoose
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staffsync';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[StaffSync Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[StaffSync Database Notice] MongoDB connection not established (${error.message}).`);
    console.warn(`[StaffSync Database Notice] Set MONGODB_URI in server/.env once MongoDB service is running.`);
    return null;
  }
};

module.exports = connectDB;
