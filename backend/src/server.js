import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api', apiRoutes);

// Root path response
app.get('/', (req, res) => {
  res.json({ message: 'SF Insight SAP SuccessFactors Visualization API is running (In-Memory Database-Free Mode).' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Start Express server directly (database-free)
app.listen(PORT, () => {
  console.log(`SF Insight Backend running in in-memory mode on port ${PORT}`);
});
