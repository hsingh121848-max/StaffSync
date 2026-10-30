// MongoDB Connection Manager via Mongoose
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  // On Vercel Serverless, skip localhost connection attempts if no cloud database URI is provided
  if (!uri && process.env.VERCEL) {
    console.log('[StaffSync Database Notice] No MONGODB_URI configured in Vercel environment. Running in evaluation demo mode.');
    return null;
  }

  const targetUri = uri || 'mongodb://127.0.0.1:27017/staffsync';

  try {
    const conn = await mongoose.connect(targetUri, {
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
