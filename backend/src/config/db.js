import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sf_insight';
    const conn = await mongoose.connect(connUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // If Mongo is not running locally, we can log a warning but don't exit in case they want to run it.
    // However, to make the hackathon app completely resilient, we can also fall back to an in-memory cache if DB fails.
    console.warn('Continuing execution. Cached data will be held in-memory if MongoDB is unavailable.');
  }
};
