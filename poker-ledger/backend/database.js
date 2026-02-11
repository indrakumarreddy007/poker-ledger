const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Database connection configuration
// Use DATABASE_URL if available (common in Vercel/Render/Heroku/Neon)
const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
};

// Fallback for local development if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  connectionConfig.user = process.env.DB_USER || 'postgres';
  connectionConfig.host = process.env.DB_HOST || 'localhost';
  connectionConfig.database = process.env.DB_NAME || 'poker_ledger';
  connectionConfig.password = process.env.DB_PASSWORD || 'postgres';
  connectionConfig.port = process.env.DB_PORT || 5432;
  // Remove connectionString if using individual params
  delete connectionConfig.connectionString;
}

const pool = new Pool(connectionConfig);

// Initialize database schema
const initializeDatabase = async () => {
  // Only initialize if we have a connection
  if (!process.env.DATABASE_URL && !process.env.DB_USER) {
    console.warn('Database configuration missing. Skipping initialization.');
    return;
  }

  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database');
    await client.query('BEGIN');

    // Users table
    // Added google_id and made password nullable for Social Login support
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT, 
        google_id TEXT UNIQUE,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
        current_admin_id TEXT NOT NULL REFERENCES users(id),
        join_code TEXT UNIQUE NOT NULL,
        created_by TEXT NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closed_at TIMESTAMP
      );
    `);

    // Session players table
    await client.query(`
      CREATE TABLE IF NOT EXISTS session_players (
        session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id),
        total_buyin INTEGER DEFAULT 0,
        current_stack INTEGER DEFAULT 0,
        cash_out_amount INTEGER,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (session_id, user_id)
      );
    `);

    // Transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        player_id TEXT NOT NULL REFERENCES users(id),
        amount INTEGER NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('buyin', 'cashout', 'addon')),
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        approved_by TEXT REFERENCES users(id)
      );
    `);

    await client.query('COMMIT');
    console.log('Database tables initialized');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
};

// Wrapper to match existing dbAsync interface but with Postgres modifications
const dbAsync = {
  // Helper to convert SQLite ? placeholders to Postgres $n
  _convertSql: (sql) => {
    let paramIndex = 1;
    // Replace ? with $1, $2, etc.
    return sql.replace(/\?/g, () => `$${paramIndex++}`);
  },

  run: async (sql, params = []) => {
    const pgSql = dbAsync._convertSql(sql);
    try {
      const res = await pool.query(pgSql, params);
      return { rowCount: res.rowCount };
    } catch (err) {
      console.error('Database Run Error:', err.message, '\nSQL:', pgSql);
      throw err;
    }
  },

  get: async (sql, params = []) => {
    const pgSql = dbAsync._convertSql(sql);
    try {
      const res = await pool.query(pgSql, params);
      return res.rows[0];
    } catch (err) {
      console.error('Database Get Error:', err.message, '\nSQL:', pgSql);
      throw err;
    }
  },

  all: async (sql, params = []) => {
    const pgSql = dbAsync._convertSql(sql);
    try {
      const res = await pool.query(pgSql, params);
      return res.rows;
    } catch (err) {
      console.error('Database All Error:', err.message, '\nSQL:', pgSql);
      throw err;
    }
  }
};

// Initialize on start
// Using a small delay to ensure env vars are loaded
setTimeout(initializeDatabase, 100);

module.exports = { db: pool, dbAsync };
