import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import database from './database/connection.js';
import { initDatabase } from './database/init.js';
import { migrateDatabase } from './database/migrate.js';
import authRoutes from './routes/auth.js';
import tripsRoutes from './routes/trips.js';
import agentsRoutes from './routes/agents.js';
import researcherRoutes from './routes/researcher.js';
import travelerRoutes from './routes/traveler.js'; // Import new traveler routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  abortOnLimit: true,
  createParentPath: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/researcher', researcherRoutes);
app.use('/api/traveler', travelerRoutes); // Use new traveler routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await database.connect();
    await initDatabase();
    await migrateDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API endpoints:`);
      console.log(`   - Auth: /api/auth`);
      console.log(`   - Trips: /api/trips`);
      console.log(`   - Agents: /api/agents`);
      console.log(`   - Researcher: /api/researcher`);
      console.log(`   - Traveler: /api/traveler`); // Add new route to console log
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
