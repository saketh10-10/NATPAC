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

// Get all promotions (public)
router.get('/promotions', async (req, res) => {
  try {
    const { destination, category } = req.query;
    let query = 'SELECT p.*, u.full_name as agent_name, u.location FROM promotions p JOIN users u ON p.agent_id = u.id WHERE p.deleted = 0';
    const params = [];

    if (destination) {
      query += ' AND p.destination LIKE ?';
      params.push(`%${destination}%`);
    }

    if (category) {
      if (destination) {
        query += ' AND p.category = ?';
      } else {
        query += ' AND p.category = ?';
      }
      params.push(category);
    }

    query += ' ORDER BY p.rating DESC, p.views DESC';

    const promotions = await database.all(query, params);
    res.json({ promotions });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
});

// Get agent's promotions (including soft deleted ones)
router.get('/my-promotions', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can access this' });
    }

    console.log('📊 Fetching my-promotions for agent ID:', req.userId);

    const promotions = await database.all(
      'SELECT * FROM promotions WHERE agent_id = ? AND deleted = 0 ORDER BY created_at DESC',
      [req.userId]
    );

    console.log('📊 Found', promotions.length, 'promotions:', promotions.map(p => ({ id: p.id, title: p.title })));

    res.json({ promotions });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
});

// Create promotion (now full trip offering)
router.post('/promotions', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can create promotions' });
    }

    const {
      title,
      description,
      destination,
      category,
      price,
      image_url,
      start_date,
      end_date,
      itinerary,
      available_slots,
      total_slots,
      highlights
    } = req.body;

    if (!title || !destination) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await database.run(
      `INSERT INTO promotions (
        agent_id, title, description, destination, category, price, image_url,
        start_date, end_date, itinerary, available_slots, total_slots, highlights
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.userId, title, description, destination, category, price, image_url,
        start_date, end_date, itinerary, available_slots || 10, total_slots || 10, highlights
      ]
    );

    res.status(201).json({
      message: 'Trip created successfully',
      promotion: { id: result.id }
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

// Update promotion (now full trip offering)
router.put('/promotions/:id', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can update promotions' });
    }

    const promotion = await database.get(
      'SELECT * FROM promotions WHERE id = ? AND agent_id = ?',
      [req.params.id, req.userId]
    );

    if (!promotion) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const {
      title,
      description,
      destination,
      category,
      price,
      image_url,
      start_date,
      end_date,
      itinerary,
      available_slots,
      total_slots,
      highlights
    } = req.body;

    await database.run(
      `UPDATE promotions SET
        title = ?, description = ?, destination = ?, category = ?, price = ?, image_url = ?,
        start_date = ?, end_date = ?, itinerary = ?, available_slots = ?, total_slots = ?, highlights = ?,
        updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [
        title || promotion.title,
        description || promotion.description,
        destination || promotion.destination,
        category || promotion.category,
        price || promotion.price,
        image_url || promotion.image_url,
        start_date || promotion.start_date,
        end_date || promotion.end_date,
        itinerary || promotion.itinerary,
        available_slots !== undefined ? available_slots : promotion.available_slots,
        total_slots !== undefined ? total_slots : promotion.total_slots,
        highlights || promotion.highlights,
        req.params.id
      ]
    );

    res.json({ message: 'Trip updated successfully' });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

// Delete promotion (soft delete)
router.delete('/promotions/:id', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can delete promotions' });
    }

    console.log('🗑️ DELETE request for promotion ID:', req.params.id, 'by agent ID:', req.userId);

    const promotion = await database.get(
      'SELECT * FROM promotions WHERE id = ? AND agent_id = ? AND deleted = 0',
      [req.params.id, req.userId]
    );

    console.log('🗑️ Found promotion:', promotion ? 'YES' : 'NO');

    if (!promotion) {
      // Let's also check if the promotion exists at all (debugging)
      const anyPromotion = await database.get('SELECT * FROM promotions WHERE id = ?', [req.params.id]);
      console.log('🗑️ Promotion exists in DB:', anyPromotion ? 'YES' : 'NO');
      if (anyPromotion) {
        console.log('🗑️ Promotion agent_id:', anyPromotion.agent_id, 'deleted:', anyPromotion.deleted);
      }
      return res.status(404).json({ error: 'Promotion not found' });
    }

    // Start transaction to soft delete promotion and remove all participants
    await database.run('BEGIN TRANSACTION');

    try {
      // Soft delete the promotion
      await database.run(
        'UPDATE promotions SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [req.params.id]
      );

      // Remove all trip participants for this deleted trip
      await database.run(
        'DELETE FROM trip_participants WHERE trip_id = ?',
        [req.params.id]
      );

      await database.run('COMMIT');

      res.json({
        message: 'Trip deleted successfully. All travelers have been removed from this trip.',
        deletedTripId: req.params.id
      });
    } catch (error) {
      await database.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ error: 'Failed to delete promotion' });
  }
});

// Send message
router.post('/messages', verifyToken, async (req, res) => {
  try {
    const { receiver_id, promotion_id, message } = req.body;

    if (!receiver_id || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await database.run(
      'INSERT INTO messages (sender_id, receiver_id, promotion_id, message) VALUES (?, ?, ?, ?)',
      [req.userId, receiver_id, promotion_id, message]
    );

    res.status(201).json({ message: 'Message sent', messageId: result.id });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get messages
router.get('/messages', verifyToken, async (req, res) => {
  try {
    const messages = await database.all(
      'SELECT * FROM messages WHERE receiver_id = ? OR sender_id = ? ORDER BY created_at DESC',
      [req.userId, req.userId]
    );

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Join a trip (for travelers)
router.post('/join-trip/:id', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'traveler') {
      return res.status(403).json({ error: 'Only travelers can join trips' });
    }

    const tripId = req.params.id;

    // Check if trip exists and has available slots
    const trip = await database.get(
      'SELECT * FROM promotions WHERE id = ? AND deleted = 0',
      [tripId]
    );

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or no longer available' });
    }

    if (trip.available_slots <= 0) {
      return res.status(400).json({ error: 'Trip is fully booked' });
    }

    // Check if traveler already joined this trip
    const existingJoin = await database.get(
      'SELECT id FROM trip_participants WHERE trip_id = ? AND traveler_id = ?',
      [tripId, req.userId]
    );

    if (existingJoin) {
      return res.status(400).json({ error: 'You have already joined this trip' });
    }

    // Start transaction
    await database.run('BEGIN TRANSACTION');

    try {
      // Add traveler to trip participants
      await database.run(
        'INSERT INTO trip_participants (trip_id, traveler_id) VALUES (?, ?)',
        [tripId, req.userId]
      );

      // Decrement available slots
      await database.run(
        'UPDATE promotions SET available_slots = available_slots - 1 WHERE id = ?',
        [tripId]
      );

      await database.run('COMMIT');

      res.json({ message: 'Successfully joined the trip!' });
    } catch (error) {
      await database.run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error joining trip:', error);
    res.status(500).json({ error: 'Failed to join trip' });
  }
});

// Get trending/popular trips (ordered by number of bookings only)
router.get('/trending-trips', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const trendingTrips = await database.all(`
      SELECT
        p.*,
        u.full_name as agent_name,
        u.location,
        (p.total_slots - p.available_slots) as bookings,
        COUNT(tp.trip_id) as participant_count
      FROM promotions p
      LEFT JOIN users u ON p.agent_id = u.id
      LEFT JOIN trip_participants tp ON p.id = tp.trip_id
      WHERE p.deleted = 0
      GROUP BY p.id
      HAVING (p.total_slots - p.available_slots) > 0  -- Only show trips with bookings
      ORDER BY
        (p.total_slots - p.available_slots) DESC       -- Strictly by number of bookings
      LIMIT ?
    `, [limit]);

    // Calculate additional stats for trending analysis
    const stats = {
      totalTrendingTrips: trendingTrips.length,
      totalBookings: trendingTrips.reduce((sum, trip) => sum + (trip.bookings || 0), 0),
      totalViews: trendingTrips.reduce((sum, trip) => sum + (trip.views || 0), 0),
      avgRating: trendingTrips.length > 0 ?
        trendingTrips.reduce((sum, trip) => sum + (trip.rating || 0), 0) / trendingTrips.length : 0
    };

    res.json({
      trendingTrips,
      stats,
      totalCount: trendingTrips.length
    });
  } catch (error) {
    console.error('Error fetching trending trips:', error);
    res.status(500).json({ error: 'Failed to fetch trending trips' });
  }
});

// ===== CLIENT MANAGEMENT ENDPOINTS =====

// Get all clients for agent
router.get('/clients', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can access client management' });
    }

    const clients = await database.all(
      'SELECT * FROM clients WHERE agent_id = ? ORDER BY created_at DESC',
      [req.userId]
    );

    res.json({ clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Create new client
router.post('/clients', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can create clients' });
    }

    const { name, email, phone, address, preferences } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Client name is required' });
    }

    const result = await database.run(
      'INSERT INTO clients (agent_id, name, email, phone, address, preferences) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, name, email, phone, address, preferences]
    );

    res.status(201).json({
      message: 'Client created successfully',
      client: {
        id: result.id,
        name,
        email,
        phone,
        address,
        preferences
      }
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client
router.put('/clients/:id', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can update clients' });
    }

    const { name, email, phone, address, preferences } = req.body;
    const clientId = req.params.id;

    // Check if client belongs to agent
    const client = await database.get(
      'SELECT * FROM clients WHERE id = ? AND agent_id = ?',
      [clientId, req.userId]
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await database.run(
      'UPDATE clients SET name = ?, email = ?, phone = ?, address = ?, preferences = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, phone, address, preferences, clientId]
    );

    res.json({ message: 'Client updated successfully' });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client
router.delete('/clients/:id', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can delete clients' });
    }

    const clientId = req.params.id;

    // Check if client belongs to agent
    const client = await database.get(
      'SELECT * FROM clients WHERE id = ? AND agent_id = ?',
      [clientId, req.userId]
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await database.run('DELETE FROM clients WHERE id = ?', [clientId]);

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// ===== CLIENT INQUIRIES =====

// Get client inquiries
router.get('/clients/:clientId/inquiries', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can access client inquiries' });
    }

    const clientId = req.params.clientId;

    // Check if client belongs to agent
    const client = await database.get(
      'SELECT * FROM clients WHERE id = ? AND agent_id = ?',
      [clientId, req.userId]
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const inquiries = await database.all(
      'SELECT * FROM client_inquiries WHERE client_id = ? ORDER BY created_at DESC',
      [clientId]
    );

    res.json({ inquiries });
  } catch (error) {
    console.error('Error fetching client inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// Create client inquiry
router.post('/clients/:clientId/inquiries', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can create inquiries' });
    }

    const clientId = req.params.clientId;
    const { destination, budget, start_date, end_date, group_size, notes } = req.body;

    // Check if client belongs to agent
    const client = await database.get(
      'SELECT * FROM clients WHERE id = ? AND agent_id = ?',
      [clientId, req.userId]
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const result = await database.run(
      'INSERT INTO client_inquiries (client_id, destination, budget, start_date, end_date, group_size, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [clientId, destination, budget, start_date, end_date, group_size, notes]
    );

    res.status(201).json({
      message: 'Inquiry created successfully',
      inquiry: {
        id: result.id,
        destination,
        budget,
        start_date,
        end_date,
        group_size,
        notes
      }
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ error: 'Failed to create inquiry' });
  }
});

// Update inquiry
router.put('/clients/:clientId/inquiries/:inquiryId', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can update inquiries' });
    }

    const { clientId, inquiryId } = req.params;
    const { destination, budget, start_date, end_date, group_size, status, notes } = req.body;

    // Check if client belongs to agent
    const client = await database.get(
      'SELECT * FROM clients WHERE id = ? AND agent_id = ?',
      [clientId, req.userId]
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Check if inquiry exists
    const inquiry = await database.get(
      'SELECT * FROM client_inquiries WHERE id = ? AND client_id = ?',
      [inquiryId, clientId]
    );

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    await database.run(
      'UPDATE client_inquiries SET destination = ?, budget = ?, start_date = ?, end_date = ?, group_size = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [destination, budget, start_date, end_date, group_size, status, notes, inquiryId]
    );

    res.json({ message: 'Inquiry updated successfully' });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

// Delete inquiry
router.delete('/clients/:clientId/inquiries/:inquiryId', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can delete inquiries' });
    }

    const { clientId, inquiryId } = req.params;

    // Check if client belongs to agent
    const client = await database.get(
      'SELECT * FROM clients WHERE id = ? AND agent_id = ?',
      [clientId, req.userId]
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await database.run('DELETE FROM client_inquiries WHERE id = ? AND client_id = ?', [inquiryId, clientId]);

    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

// ===== CLIENT BOOKINGS =====

// Get client bookings
router.get('/clients/:clientId/bookings', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can access client bookings' });
    }

    const clientId = req.params.clientId;

    // Check if client belongs to agent
    const client = await database.get(
      'SELECT * FROM clients WHERE id = ? AND agent_id = ?',
      [clientId, req.userId]
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const bookings = await database.all(`
      SELECT cb.*, p.title as trip_title, ci.destination as inquiry_destination
      FROM client_bookings cb
      LEFT JOIN promotions p ON cb.trip_id = p.id
      LEFT JOIN client_inquiries ci ON cb.inquiry_id = ci.id
      WHERE cb.client_id = ?
      ORDER BY cb.booking_date DESC
    `, [clientId]);

    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching client bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create client booking
router.post('/clients/:clientId/bookings', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can create bookings' });
    }

    const clientId = req.params.clientId;
    const { inquiry_id, trip_id, booking_date, amount, currency, notes } = req.body;

    // Check if client belongs to agent
    const client = await database.get(
      'SELECT * FROM clients WHERE id = ? AND agent_id = ?',
      [clientId, req.userId]
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const result = await database.run(
      'INSERT INTO client_bookings (client_id, inquiry_id, trip_id, booking_date, amount, currency, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [clientId, inquiry_id, trip_id, booking_date, amount, currency || 'INR', notes]
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        id: result.id,
        inquiry_id,
        trip_id,
        booking_date,
        amount,
        currency,
        notes
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// ===== CLIENT NOTES/FOLLOWUPS =====

// Get client notes
router.get('/clients/:clientId/notes', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can access client notes' });
    }

    const clientId = req.params.clientId;

    // Check if client belongs to agent
    const client = await database.get(
      'SELECT * FROM clients WHERE id = ? AND agent_id = ?',
      [clientId, req.userId]
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const notes = await database.all(
      'SELECT * FROM client_notes WHERE client_id = ? ORDER BY created_at DESC',
      [clientId]
    );

    res.json({ notes });
  } catch (error) {
    console.error('Error fetching client notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create client note/followup
router.post('/clients/:clientId/notes', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can create notes' });
    }

    const clientId = req.params.clientId;
    const { note, reminder_date, priority } = req.body;

    // Check if client belongs to agent
    const client = await database.get(
      'SELECT * FROM clients WHERE id = ? AND agent_id = ?',
      [clientId, req.userId]
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const result = await database.run(
      'INSERT INTO client_notes (client_id, note, reminder_date, priority) VALUES (?, ?, ?, ?)',
      [clientId, note, reminder_date, priority || 'medium']
    );

    res.status(201).json({
      message: 'Note created successfully',
      note: {
        id: result.id,
        note,
        reminder_date,
        priority
      }
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.put('/clients/:clientId/notes/:noteId', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can update notes' });
    }

    const { clientId, noteId } = req.params;
    const { note, reminder_date, priority, is_completed } = req.body;

    // Check if client belongs to agent
    const client = await database.get(
      'SELECT * FROM clients WHERE id = ? AND agent_id = ?',
      [clientId, req.userId]
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await database.run(
      'UPDATE client_notes SET note = ?, reminder_date = ?, priority = ?, is_completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND client_id = ?',
      [note, reminder_date, priority, is_completed, noteId, clientId]
    );

    res.json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/clients/:clientId/notes/:noteId', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'agent') {
      return res.status(403).json({ error: 'Only agents can delete notes' });
    }

    const { clientId, noteId } = req.params;

    // Check if client belongs to agent
    const client = await database.get(
      'SELECT * FROM clients WHERE id = ? AND agent_id = ?',
      [clientId, req.userId]
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await database.run('DELETE FROM client_notes WHERE id = ? AND client_id = ?', [noteId, clientId]);

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
