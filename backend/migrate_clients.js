const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./database/tripconnect.db');

// Create client management tables
db.serialize(() => {
  // Clients table
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      address TEXT,
      preferences TEXT,
      total_inquiries INTEGER DEFAULT 0,
      total_bookings INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agent_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Client inquiries table
  db.run(`
    CREATE TABLE IF NOT EXISTS client_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      destination TEXT NOT NULL,
      budget DECIMAL(10,2),
      start_date DATE,
      end_date DATE,
      group_size INTEGER DEFAULT 1,
      status TEXT CHECK(status IN ('pending', 'contacted', 'quoted', 'booked', 'cancelled', 'completed')) DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
    )
  `);

  // Client bookings table
  db.run(`
    CREATE TABLE IF NOT EXISTS client_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      inquiry_id INTEGER,
      trip_id INTEGER,
      booking_date DATE NOT NULL,
      status TEXT CHECK(status IN ('confirmed', 'pending', 'cancelled', 'completed')) DEFAULT 'pending',
      amount DECIMAL(10,2),
      currency TEXT DEFAULT 'INR',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
      FOREIGN KEY (inquiry_id) REFERENCES client_inquiries (id) ON DELETE SET NULL,
      FOREIGN KEY (trip_id) REFERENCES promotions (id) ON DELETE SET NULL
    )
  `);

  // Client notes/followups table
  db.run(`
    CREATE TABLE IF NOT EXISTS client_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      note TEXT NOT NULL,
      reminder_date DATETIME,
      priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      is_completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
    )
  `);

  // Update triggers for statistics
  db.run(`
    CREATE TRIGGER IF NOT EXISTS update_client_stats_insert
    AFTER INSERT ON client_inquiries
    BEGIN
      UPDATE clients SET total_inquiries = total_inquiries + 1 WHERE id = NEW.client_id;
    END
  `);

  db.run(`
    CREATE TRIGGER IF NOT EXISTS update_client_stats_booking_insert
    AFTER INSERT ON client_bookings
    BEGIN
      UPDATE clients SET total_bookings = total_bookings + 1 WHERE id = NEW.client_id;
    END
  `);

  console.log('Client management tables created successfully');
  db.close();
});
