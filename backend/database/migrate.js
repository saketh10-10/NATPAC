import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'tripconnect.db');

export const migrateDatabase = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database for migration:', err);
        reject(err);
        return;
      }
      console.log('Connected to database for migration');
    });

    db.serialize(() => {
      // Add new columns to existing promotions table
      const migrations = [
        'ALTER TABLE promotions ADD COLUMN start_date DATE;',
        'ALTER TABLE promotions ADD COLUMN end_date DATE;',
        'ALTER TABLE promotions ADD COLUMN itinerary TEXT;',
        'ALTER TABLE promotions ADD COLUMN available_slots INTEGER DEFAULT 10;',
        'ALTER TABLE promotions ADD COLUMN total_slots INTEGER DEFAULT 10;',
        'ALTER TABLE promotions ADD COLUMN highlights TEXT;',
        `CREATE TABLE IF NOT EXISTS trip_participants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          trip_id INTEGER NOT NULL,
          traveler_id INTEGER NOT NULL,
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (trip_id) REFERENCES promotions (id) ON DELETE CASCADE,
          FOREIGN KEY (traveler_id) REFERENCES users (id) ON DELETE CASCADE,
          UNIQUE(trip_id, traveler_id)
        );`
      ];

      let completedMigrations = 0;
      const totalMigrations = migrations.length;

      migrations.forEach((migration, index) => {
        db.run(migration, (err) => {
          if (err) {
            // Ignore errors if column already exists
            if (!err.message.includes('duplicate column name')) {
              console.error(`Migration ${index + 1} failed:`, err);
              reject(err);
              return;
            }
          }

          completedMigrations++;
          console.log(`Migration ${index + 1}/${totalMigrations} completed`);

          if (completedMigrations === totalMigrations) {
            console.log('All migrations completed successfully');
            db.close((err) => {
              if (err) {
                console.error('Error closing database:', err);
                reject(err);
              } else {
                resolve();
              }
            });
          }
        });
      });
    });
  });
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateDatabase()
    .then(() => {
      console.log('Database migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database migration failed:', error);
      process.exit(1);
    });
}
