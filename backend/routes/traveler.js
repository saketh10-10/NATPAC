import express from 'express';
import db from '../database/connection.js'; // Corrected path
import authenticateToken from '../middleware/authenticateToken.js'; // Corrected path
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = express.Router();

// GET /api/traveler/my-joined-trips - Get all trips joined by the authenticated traveler
router.get('/my-joined-trips', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // Corrected userId access

    const joinedTrips = await db.all(
      `SELECT
         p.id,
         p.title,
         p.destination,
         p.start_date as startDate,
         p.end_date as endDate,
         p.itinerary,
         p.price as cost,
         p.available_slots as availableSlots,
         p.total_slots as totalSlots,
         p.image_url,
         p.agent_id,
         u.full_name as agent_name,
         u.email as agent_email
       FROM promotions p
       JOIN trip_participants tp ON p.id = tp.trip_id
       JOIN users u ON p.agent_id = u.id
       WHERE tp.traveler_id = ? AND p.deleted = 0`,
      [userId]
    );

    res.json({ success: true, joinedTrips });
  } catch (error) {
    console.error('Error fetching joined trips:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch joined trips.' });
  }
});

// Leave a trip
router.delete('/leave-trip/:tripId', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const tripId = req.params.tripId;

    if (!tripId) {
      return res.status(400).json({ success: false, error: 'Trip ID is required.' });
    }

    // Check if the user is actually joined to this trip
    const participant = await db.get(
      'SELECT * FROM trip_participants WHERE trip_id = ? AND traveler_id = ?',
      [tripId, userId]
    );

    if (!participant) {
      return res.status(404).json({ success: false, error: 'You are not joined to this trip.' });
    }

    // Check if the trip exists and is not deleted
    const trip = await db.get(
      'SELECT * FROM promotions WHERE id = ? AND deleted = 0',
      [tripId]
    );

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found or no longer available.' });
    }

    // Allow leaving trips anytime (removed the started trip restriction for flexibility)

    // Remove the participant from the trip
    await db.run(
      'DELETE FROM trip_participants WHERE trip_id = ? AND traveler_id = ?',
      [tripId, userId]
    );

    // Increment available slots back
    await db.run(
      'UPDATE promotions SET available_slots = available_slots + 1 WHERE id = ?',
      [tripId]
    );

    res.json({
      success: true,
      message: 'Successfully left the trip.',
      tripId: tripId
    });

  } catch (error) {
    console.error('Error leaving trip:', error);
    res.status(500).json({ success: false, error: 'Failed to leave the trip.' });
  }
});

// Upload document to trip wallet
router.post('/trip-documents/:tripId', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const tripId = req.params.tripId;
    const { document_type, description } = req.body;

    if (!req.files || !req.files.document) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const file = req.files.document;

    // Check if user is joined to this trip
    const participant = await db.get(
      'SELECT * FROM trip_participants WHERE trip_id = ? AND traveler_id = ?',
      [tripId, userId]
    );

    if (!participant) {
      return res.status(403).json({ success: false, error: 'You are not joined to this trip' });
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ success: false, error: 'Invalid file type. Allowed: JPG, PNG, GIF, PDF, DOC, DOCX' });
    }

    if (file.size > maxSize) {
      return res.status(400).json({ success: false, error: 'File too large. Maximum size: 10MB' });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
    const filePath = path.join(__dirname, 'uploads', 'trip-documents', uniqueName);

    // Move file to uploads directory
    await file.mv(filePath);

    // Save to database
    const result = await db.run(
      'INSERT INTO trip_documents (trip_id, traveler_id, file_name, original_name, file_path, file_size, mime_type, document_type, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [tripId, userId, uniqueName, file.name, filePath, file.size, file.mimetype, document_type || 'other', description || '']
    );

    res.json({
      success: true,
      document: {
        id: result.id,
        file_name: uniqueName,
        original_name: file.name,
        file_size: file.size,
        mime_type: file.mimetype,
        document_type: document_type || 'other',
        description: description || '',
        uploaded_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ success: false, error: 'Failed to upload document' });
  }
});

// Get documents for a trip
router.get('/trip-documents/:tripId', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const tripId = req.params.tripId;

    // Check if user is joined to this trip
    const participant = await db.get(
      'SELECT * FROM trip_participants WHERE trip_id = ? AND traveler_id = ?',
      [tripId, userId]
    );

    if (!participant) {
      return res.status(403).json({ success: false, error: 'You are not joined to this trip' });
    }

    const documents = await db.all(
      'SELECT * FROM trip_documents WHERE trip_id = ? AND traveler_id = ? ORDER BY uploaded_at DESC',
      [tripId, userId]
    );

    res.json({ success: true, documents });

  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch documents' });
  }
});

// Download document
router.get('/trip-documents/download/:docId', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const docId = req.params.docId;

    const document = await db.get(
      'SELECT * FROM trip_documents WHERE id = ? AND traveler_id = ?',
      [docId, userId]
    );

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({ success: false, error: 'File not found on server' });
    }

    res.download(document.file_path, document.original_name);

  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ success: false, error: 'Failed to download document' });
  }
});

// Delete document
router.delete('/trip-documents/:docId', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const docId = req.params.docId;

    const document = await db.get(
      'SELECT * FROM trip_documents WHERE id = ? AND traveler_id = ?',
      [docId, userId]
    );

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    // Delete from database
    await db.run('DELETE FROM trip_documents WHERE id = ?', [docId]);

    res.json({ success: true, message: 'Document deleted successfully' });

  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ success: false, error: 'Failed to delete document' });
  }
});

// Update document metadata
router.put('/trip-documents/:docId', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const docId = req.params.docId;
    const { document_type, description } = req.body;

    const document = await db.get(
      'SELECT * FROM trip_documents WHERE id = ? AND traveler_id = ?',
      [docId, userId]
    );

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    await db.run(
      'UPDATE trip_documents SET document_type = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [document_type || document.document_type, description || document.description, docId]
    );

    res.json({ success: true, message: 'Document updated successfully' });

  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ success: false, error: 'Failed to update document' });
  }
});

export default router;
