import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  companyId: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  baseUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Connection = mongoose.model('Connection', connectionSchema);
