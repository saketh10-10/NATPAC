import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'tripconnect.db');

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
    });

    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('traveler', 'agent', 'researcher')),
          full_name TEXT,
          phone TEXT,
          location TEXT,
          bio TEXT,
          profile_image TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Trips table
      db.run(`
        CREATE TABLE IF NOT EXISTS trips (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          destination TEXT NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          budget DECIMAL(10,2),
          status TEXT DEFAULT 'planning' CHECK(status IN ('planning', 'ongoing', 'completed')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Trip documents/files
      db.run(`
        CREATE TABLE IF NOT EXISTS trip_documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          trip_id INTEGER NOT NULL,
          file_name TEXT NOT NULL,
          file_type TEXT NOT NULL,
          file_path TEXT NOT NULL,
          document_type TEXT CHECK(document_type IN ('flight', 'hotel', 'itinerary', 'expense', 'other')),
          uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
        )
      `);

      // Expenses table
      db.run(`
        CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          trip_id INTEGER NOT NULL,
          category TEXT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          currency TEXT DEFAULT 'USD',
          description TEXT,
          date DATE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
        )
      `);

      // Agent promotions (now full trip offerings)
      db.run(`
        CREATE TABLE IF NOT EXISTS promotions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          agent_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          destination TEXT NOT NULL,
          category TEXT,
          price DECIMAL(10,2),
          image_url TEXT,
          rating DECIMAL(3,2) DEFAULT 0,
          views INTEGER DEFAULT 0,
          start_date DATE,
          end_date DATE,
          itinerary TEXT,
          available_slots INTEGER DEFAULT 10,
          total_slots INTEGER DEFAULT 10,
          highlights TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (agent_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Messages between travelers and agents
      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sender_id INTEGER NOT NULL,
          receiver_id INTEGER NOT NULL,
          promotion_id INTEGER,
          message TEXT NOT NULL,
          read_status INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (promotion_id) REFERENCES promotions (id) ON DELETE SET NULL
        )
      `);

      // Trip participants (travelers who joined agent trips)
      db.run(`
        CREATE TABLE IF NOT EXISTS trip_participants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          trip_id INTEGER NOT NULL,
          traveler_id INTEGER NOT NULL,
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (trip_id) REFERENCES promotions (id) ON DELETE CASCADE,
          FOREIGN KEY (traveler_id) REFERENCES users (id) ON DELETE CASCADE,
          UNIQUE(trip_id, traveler_id)
        )
      `);

      // Research data access logs
      db.run(`
        CREATE TABLE IF NOT EXISTS research_access (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          researcher_id INTEGER NOT NULL,
          data_type TEXT NOT NULL,
          query_params TEXT,
          accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (researcher_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Insert default users
      const defaultUsers = [
        {
          username: 'traveler1',
          email: 'traveler@example.com',
          password: 'password123',
          role: 'traveler',
          full_name: 'John Traveler'
        },
        {
          username: 'agent1',
          email: 'agent@example.com',
          password: 'password123',
          role: 'agent',
          full_name: 'Jane Agent'
        },
        {
          username: 'researcher1',
          email: 'researcher@example.com',
          password: 'password123',
          role: 'researcher',
          full_name: 'Dr. Research'
        }
      ];

      defaultUsers.forEach(user => {
        const hashedPassword = bcrypt.hashSync(user.password, 10);
        db.run(
          `INSERT OR IGNORE INTO users (username, email, password, role, full_name) VALUES (?, ?, ?, ?, ?)`,
          [user.username, user.email, hashedPassword, user.role, user.full_name]
        );
      });

      db.get('SELECT 1', (err) => {
        if (err) {
          console.error('Database initialization error:', err);
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

export { dbPath };
