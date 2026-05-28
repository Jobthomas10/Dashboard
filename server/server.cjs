const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Open/Create persistent SQLite Database file in project root
const dbPath = path.join(__dirname, '../sales.db');
console.log(`[Database] Connecting to SQLite DB at: ${dbPath}`);
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[Database] Failed to open database:', err.message);
  } else {
    console.log('[Database] Opened successfully.');
    initializeDatabase();
  }
});

// Rich mock data used for auto-seeding
const SEED_DATA = [
  { id: "ORD-1001", date: "2026-01-05", customerName: "Sarah Jenkins", productName: "MacBook Pro M3", category: "Electronics", region: "North America", revenue: 2499, profit: 875, status: "Delivered" },
  { id: "ORD-1002", date: "2026-01-08", customerName: "Liam O'Connor", productName: "Nike Air Max 270", category: "Apparel", region: "Europe", revenue: 150, profit: 65, status: "Delivered" },
  { id: "ORD-1003", date: "2026-01-12", customerName: "Yuki Tanaka", productName: "Sony WH-1000XM5", category: "Electronics", region: "Asia", revenue: 399, profit: 140, status: "Delivered" },
  { id: "ORD-1004", date: "2026-01-18", customerName: "Mateo Silva", productName: "Figma Professional", category: "Software", region: "LATAM", revenue: 180, profit: 162, status: "Delivered" },
  { id: "ORD-1005", date: "2026-01-22", customerName: "Fatima Al-Sayed", productName: "Dyson V15 Detect", category: "Home", region: "Middle East", revenue: 749, profit: 225, status: "Delivered" },
  { id: "ORD-1006", date: "2026-01-26", customerName: "Alex Mercer", productName: "Slack Pro Subscription", category: "Software", region: "North America", revenue: 320, profit: 288, status: "Delivered" },
  { id: "ORD-1007", date: "2026-01-29", customerName: "Emma Watson", productName: "Patagonia Torrentshell", category: "Apparel", region: "Europe", revenue: 180, profit: 72, status: "Shipped" },
  { id: "ORD-1008", date: "2026-02-02", customerName: "Carlos Santana", productName: "iPad Air", category: "Electronics", region: "LATAM", revenue: 599, profit: 210, status: "Delivered" },
  { id: "ORD-1009", date: "2026-02-06", customerName: "John Doe", productName: "Philips Hue Starter Kit", category: "Home", region: "North America", revenue: 199, profit: 80, status: "Delivered" },
  { id: "ORD-1010", date: "2026-02-10", customerName: "Sophia Dubois", productName: "Adobe Creative Cloud", category: "Software", region: "Europe", revenue: 600, profit: 540, status: "Delivered" },
  { id: "ORD-1011", date: "2026-02-15", customerName: "Yuki Tanaka", productName: "MacBook Pro M3", category: "Electronics", region: "Asia", revenue: 2499, profit: 875, status: "Delivered" },
  { id: "ORD-1012", date: "2026-02-18", customerName: "David Miller", productName: "Nike Air Max 270", category: "Apparel", region: "North America", revenue: 150, profit: 65, status: "Delivered" },
  { id: "ORD-1020", date: "2026-03-19", customerName: "Fatima Al-Sayed", productName: "Samsung Galaxy S24", category: "Electronics", region: "Middle East", revenue: 899, profit: 315, status: "Delivered" },
  { id: "ORD-1021", date: "2026-03-22", customerName: "Zahra Mansour", productName: "Adobe Creative Cloud", category: "Software", region: "Middle East", revenue: 600, profit: 540, status: "Processing" },
  { id: "ORD-1022", date: "2026-03-25", customerName: "Liam O'Connor", productName: "Nespresso Vertuo Next", category: "Home", region: "Europe", revenue: 169, profit: 50, status: "Shipped" },
  { id: "ORD-1023", date: "2026-03-29", customerName: "Carlos Santana", productName: "Nike Air Max 270", category: "Apparel", region: "LATAM", revenue: 150, profit: 65, status: "Delivered" },
  { id: "ORD-1024", date: "2026-04-02", customerName: "Sophia Dubois", productName: "MacBook Pro M3", category: "Electronics", region: "Europe", revenue: 2499, profit: 875, status: "Delivered" },
  { id: "ORD-1025", date: "2026-04-05", customerName: "David Miller", productName: "Cursor Pro Annual", category: "Software", region: "North America", revenue: 240, profit: 216, status: "Delivered" },
  { id: "ORD-1026", date: "2026-04-10", customerName: "Hiroshi Sato", productName: "Dyson V15 Detect", category: "Home", region: "Asia", revenue: 749, profit: 225, status: "Delivered" },
  { id: "ORD-1038", date: "2026-05-16", customerName: "Alex Mercer", productName: "MacBook Pro M3", category: "Electronics", region: "North America", revenue: 2499, profit: 875, status: "Delivered" },
  { id: "ORD-1039", date: "2026-05-19", customerName: "Chloe Dupont", productName: "Patagonia Torrentshell", category: "Apparel", region: "Europe", revenue: 180, profit: 72, status: "Delivered" },
  { id: "ORD-1040", date: "2026-05-21", customerName: "Liam O'Connor", productName: "Cursor Pro Annual", category: "Software", region: "Europe", revenue: 240, profit: 216, status: "Delivered" },
  { id: "ORD-1041", date: "2026-05-22", customerName: "Emma Watson", productName: "Ember Smart Mug", category: "Home", region: "Europe", revenue: 129, profit: 39, status: "Shipped" },
  { id: "ORD-1042", date: "2026-05-24", customerName: "Yuki Tanaka", productName: "Samsung Galaxy S24", category: "Electronics", region: "Asia", revenue: 899, profit: 315, status: "Shipped" },
  { id: "ORD-1043", date: "2026-05-25", customerName: "Sarah Jenkins", productName: "iRobot Roomba j7", category: "Home", region: "North America", revenue: 599, profit: 180, status: "Processing" },
  { id: "ORD-1044", date: "2026-05-26", customerName: "Carlos Santana", productName: "Adobe Creative Cloud", category: "Software", region: "LATAM", revenue: 600, profit: 540, status: "Delivered" },
  { id: "ORD-1045", date: "2026-05-27", customerName: "Fatima Al-Sayed", productName: "The North Face Nuptse", category: "Apparel", region: "Middle East", revenue: 320, profit: 128, status: "Processing" },
  { id: "ORD-1046", date: "2026-05-28", customerName: "Olivia Wilson", productName: "Nike Air Max 270", category: "Apparel", region: "North America", revenue: 150, profit: 65, status: "Delivered" }
];

// Initialize and Create Database Tables
function initializeDatabase() {
  db.serialize(() => {
    // Check if the sales table already exists before creating/seeding
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='sales'", (err, row) => {
      const tableExists = !!row;

      // Create sales log table
      db.run(`
        CREATE TABLE IF NOT EXISTS sales (
          id TEXT PRIMARY KEY,
          date TEXT NOT NULL,
          customerName TEXT NOT NULL,
          productName TEXT NOT NULL,
          category TEXT NOT NULL,
          region TEXT NOT NULL,
          revenue REAL NOT NULL,
          profit REAL NOT NULL,
          status TEXT NOT NULL
        )
      `, (createErr) => {
        if (createErr) {
          console.error('[Database] Schema creation failed:', createErr.message);
        } else {
          console.log('[Database] Schema verified.');
          // Only seed if this is the very first time the table is created
          if (!tableExists) {
            console.log('[Database] Table was newly created. Seeding baseline sales records...');
            seedDatabase();
          } else {
            console.log('[Database] Table already exists. Skipping baseline seeding to preserve user-initiated wipes.');
          }
        }
      });
    });
  });
}

// Seed mock data
function seedDatabase() {
  const stmt = db.prepare(`
    INSERT INTO sales (id, date, customerName, productName, category, region, revenue, profit, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  db.serialize(() => {
    SEED_DATA.forEach(r => {
      stmt.run(r.id, r.date, r.customerName, r.productName, r.category, r.region, r.revenue, r.profit, r.status);
    });
    stmt.finalize((finalizeErr) => {
      if (finalizeErr) {
        console.error('[Database] Seeding finalized with error:', finalizeErr.message);
      } else {
        console.log(`[Database] Seeding complete. Successfully loaded ${SEED_DATA.length} default orders.`);
      }
    });
  });
}

// --- REST API ENDPOINTS ---

// 1. GET /api/sales - Retrieve all records sorted by date descending
app.get('/api/sales', (req, res) => {
  console.log('[API] GET /api/sales called');
  db.all('SELECT * FROM sales ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      console.error('[API] GET /api/sales query failed:', err.message);
      return res.status(500).json({ error: 'Database fetch operation failed.' });
    }
    res.json(rows);
  });
});

// 2. POST /api/sales - Bulk persistent insertion of records (CSV upload sync)
app.post('/api/sales', (req, res) => {
  console.log('[API] POST /api/sales called');
  const records = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'Invalid payload. Expecting a non-empty array of records.' });
  }

  // Prepared statement for fast bulk insertions
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO sales (id, date, customerName, productName, category, region, revenue, profit, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    let errors = 0;
    records.forEach(r => {
      stmt.run(r.id, r.date, r.customerName, r.productName, r.category, r.region, r.revenue, r.profit, r.status, (err) => {
        if (err) {
          console.error(`[API] Failed to insert record ${r.id}:`, err.message);
          errors++;
        }
      });
    });

    db.run('COMMIT', (err) => {
      stmt.finalize();
      if (err) {
        console.error('[API] Transaction commit failed:', err.message);
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Transaction failed to persist data.' });
      }
      
      const successCount = records.length - errors;
      console.log(`[API] Bulk insertion finished. ${successCount} successful, ${errors} failed.`);
      res.json({ 
        message: 'Persistence sync complete.', 
        inserted: successCount, 
        failed: errors 
      });
    });
  });
});

// 3. DELETE /api/sales/reset - Truncates database and re-seeds mock data
app.delete('/api/sales/reset', (req, res) => {
  console.log('[API] DELETE /api/sales/reset called');
  
  db.serialize(() => {
    db.run('DELETE FROM sales', (err) => {
      if (err) {
        console.error('[API] Truncation failed:', err.message);
        return res.status(500).json({ error: 'Failed to reset tables.' });
      }
      
      console.log('[API] Table truncated. Restoring default mock data...');
      const stmt = db.prepare(`
        INSERT INTO sales (id, date, customerName, productName, category, region, revenue, profit, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      SEED_DATA.forEach(r => {
        stmt.run(r.id, r.date, r.customerName, r.productName, r.category, r.region, r.revenue, r.profit, r.status);
      });
      
      stmt.finalize((finalizeErr) => {
        if (finalizeErr) {
          console.error('[API] Reset seed finalization failed:', finalizeErr.message);
          return res.status(500).json({ error: 'Failed to seed database during reset.' });
        }
        console.log('[API] Database reset complete.');
        res.json({ message: 'Database successfully re-seeded.', recordsCount: SEED_DATA.length });
      });
    });
  });
});

// 4. DELETE /api/sales/clear - Wipes all persistent records in SQLite database
app.delete('/api/sales/clear', (req, res) => {
  console.log('[API] DELETE /api/sales/clear called');
  db.run('DELETE FROM sales', (err) => {
    if (err) {
      console.error('[API] Truncation failed:', err.message);
      return res.status(500).json({ error: 'Failed to empty database logs.' });
    }
    console.log('[API] All database records deleted.');
    res.json({ message: 'All database records deleted successfully.', recordsCount: 0 });
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Persisted Sales API listening on port ${PORT}`);
  console.log(`===============================================`);
});
