import express from 'express';
import jwt from 'jsonwebtoken';
import database from '../database/connection.js';

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get traveler statistics
router.get('/traveler-stats', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'researcher') {
      return res.status(403).json({ error: 'Only researchers can access this' });
    }

    // Log access
    await database.run(
      'INSERT INTO research_access (researcher_id, data_type) VALUES (?, ?)',
      [req.userId, 'traveler_stats']
    );

    const stats = await database.get(`
      SELECT 
        COUNT(DISTINCT u.id) as total_travelers,
        COUNT(DISTINCT t.id) as total_trips,
        AVG(t.budget) as avg_budget,
        COUNT(DISTINCT t.destination) as unique_destinations
      FROM users u
      LEFT JOIN trips t ON u.id = t.user_id
      WHERE u.role = 'traveler'
    `);

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching traveler stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get destination insights
router.get('/destination-insights', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'researcher') {
      return res.status(403).json({ error: 'Only researchers can access this' });
    }

    // Log access
    await database.run(
      'INSERT INTO research_access (researcher_id, data_type) VALUES (?, ?)',
      [req.userId, 'destination_insights']
    );

    const insights = await database.all(`
      SELECT 
        destination,
        COUNT(*) as trip_count,
        AVG(budget) as avg_budget,
        COUNT(DISTINCT user_id) as unique_travelers
      FROM trips
      GROUP BY destination
      ORDER BY trip_count DESC
      LIMIT 20
    `);

    res.json({ insights });
  } catch (error) {
    console.error('Error fetching destination insights:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// Get expense analysis
router.get('/expense-analysis', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'researcher') {
      return res.status(403).json({ error: 'Only researchers can access this' });
    }

    // Log access
    await database.run(
      'INSERT INTO research_access (researcher_id, data_type) VALUES (?, ?)',
      [req.userId, 'expense_analysis']
    );

    const analysis = await database.all(`
      SELECT 
        category,
        COUNT(*) as count,
        AVG(amount) as avg_amount,
        SUM(amount) as total_amount
      FROM expenses
      GROUP BY category
      ORDER BY total_amount DESC
    `);

    res.json({ analysis });
  } catch (error) {
    console.error('Error fetching expense analysis:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

// Get agent performance
router.get('/agent-performance', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'researcher') {
      return res.status(403).json({ error: 'Only researchers can access this' });
    }

    // Log access
    await database.run(
      'INSERT INTO research_access (researcher_id, data_type) VALUES (?, ?)',
      [req.userId, 'agent_performance']
    );

    const performance = await database.all(`
      SELECT 
        u.id,
        u.full_name,
        u.location,
        COUNT(p.id) as promotion_count,
        AVG(p.rating) as avg_rating,
        SUM(p.views) as total_views
      FROM users u
      LEFT JOIN promotions p ON u.id = p.agent_id
      WHERE u.role = 'agent'
      GROUP BY u.id
      ORDER BY total_views DESC
    `);

    res.json({ performance });
  } catch (error) {
    console.error('Error fetching agent performance:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// Get travel trends
router.get('/travel-trends', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'researcher') {
      return res.status(403).json({ error: 'Only researchers can access this' });
    }

    // Log access
    await database.run(
      'INSERT INTO research_access (researcher_id, data_type) VALUES (?, ?)',
      [req.userId, 'travel_trends']
    );

    const trends = await database.all(`
      SELECT 
        strftime('%Y-%m', start_date) as month,
        COUNT(*) as trip_count,
        AVG(budget) as avg_budget
      FROM trips
      GROUP BY strftime('%Y-%m', start_date)
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json({ trends });
  } catch (error) {
    console.error('Error fetching travel trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// Get research access logs
router.get('/access-logs', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'researcher') {
      return res.status(403).json({ error: 'Only researchers can access this' });
    }

    const logs = await database.all(`
      SELECT * FROM research_access
      WHERE researcher_id = ?
      ORDER BY accessed_at DESC
      LIMIT 100
    `, [req.userId]);

    res.json({ logs });
  } catch (error) {
    console.error('Error fetching access logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

export default router;
