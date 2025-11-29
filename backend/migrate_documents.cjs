const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./database/tripconnect.db');

// Add document categories and enhance document storage
db.serialize(() => {
  // Create trip_documents table if it doesn't exist (enhance it)
  db.run(`
    CREATE TABLE IF NOT EXISTS trip_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      traveler_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      document_type TEXT CHECK(document_type IN ('ticket', 'accommodation', 'itinerary', 'payment', 'insurance', 'visa', 'other')) DEFAULT 'other',
      description TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES promotions (id) ON DELETE CASCADE,
      FOREIGN KEY (traveler_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.log('Error creating trip_documents table:', err);
    } else {
      console.log('Enhanced trip_documents table created successfully');
    }

    // Create uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    const tripDocsDir = path.join(uploadsDir, 'trip-documents');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('Created uploads directory');
    }

    if (!fs.existsSync(tripDocsDir)) {
      fs.mkdirSync(tripDocsDir, { recursive: true });
      console.log('Created trip-documents directory');
    }

    db.close();
  });
});
