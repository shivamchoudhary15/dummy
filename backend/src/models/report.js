import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  objectType: { type: String, required: true }, // "User" | "Position"
  filters: { type: Object, default: {} },
  chartType: { type: String, required: true }, // "bar" | "pie"
  groupBy: { type: String, required: true },
  aggregation: { type: String, required: true }, // "count" | "sum" | "average"
  numericField: { type: String, default: "" },
  generatedAt: { type: Date, default: Date.now }
});

export const Report = mongoose.model('Report', reportSchema);
