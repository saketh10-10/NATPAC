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

// Get all trips for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const trips = await database.all(
      'SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );

    res.json({ trips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// Get single trip
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const trip = await database.get(
      'SELECT * FROM trips WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Get documents
    const documents = await database.all(
      'SELECT * FROM trip_documents WHERE trip_id = ?',
      [trip.id]
    );

    // Get expenses
    const expenses = await database.all(
      'SELECT * FROM expenses WHERE trip_id = ?',
      [trip.id]
    );

    res.json({ trip, documents, expenses });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

// Create trip
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, destination, start_date, end_date, budget } = req.body;

    if (!title || !destination || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await database.run(
      'INSERT INTO trips (user_id, title, description, destination, start_date, end_date, budget) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.userId, title, description, destination, start_date, end_date, budget]
    );

    res.status(201).json({
      message: 'Trip created successfully',
      trip: { id: result.id, user_id: req.userId, title, destination, start_date, end_date }
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

// Update trip
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, destination, start_date, end_date, budget, status } = req.body;

    const trip = await database.get(
      'SELECT * FROM trips WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    await database.run(
      'UPDATE trips SET title = ?, description = ?, destination = ?, start_date = ?, end_date = ?, budget = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title || trip.title, description || trip.description, destination || trip.destination, start_date || trip.start_date, end_date || trip.end_date, budget || trip.budget, status || trip.status, req.params.id]
    );

    res.json({ message: 'Trip updated successfully' });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

// Delete trip
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const trip = await database.get(
      'SELECT * FROM trips WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    await database.run('DELETE FROM trips WHERE id = ?', [req.params.id]);

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

// Add expense
router.post('/:id/expenses', verifyToken, async (req, res) => {
  try {
    const { category, amount, currency, description, date } = req.body;

    const trip = await database.get(
      'SELECT * FROM trips WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const result = await database.run(
      'INSERT INTO expenses (trip_id, category, amount, currency, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, category, amount, currency, description, date]
    );

    res.status(201).json({ message: 'Expense added', expense: { id: result.id } });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

export default router;
