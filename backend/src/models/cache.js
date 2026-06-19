import mongoose from 'mongoose';

const cacheSchema = new mongoose.Schema({
  companyId: { type: String, required: true },
  objectType: { type: String, required: true }, // "User" | "Position"
  data: { type: Array, required: true },
  fetchedAt: { type: Date, default: Date.now }
});

// Compound index to ensure uniqueness per company and object type
cacheSchema.index({ companyId: 1, objectType: 1 }, { unique: true });

export const Cache = mongoose.model('Cache', cacheSchema);
