const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      email_verified BOOLEAN DEFAULT FALSE,
      email_verify_token TEXT,
      plan TEXT DEFAULT 'free',
      doc_count INTEGER DEFAULT 0,
      doc_limit INTEGER DEFAULT 3,
      seat_count INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS device_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      fingerprint TEXT NOT NULL,
      user_agent TEXT,
      ip TEXT,
      last_seen TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, fingerprint)
    );

    CREATE TABLE IF NOT EXISTS download_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      document_id TEXT,
      format TEXT DEFAULT 'pdf',
      used BOOLEAN DEFAULT FALSE,
      used_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS doc_usage (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      doc_type TEXT,
      format TEXT,
      jurisdiction TEXT,
      query TEXT,
      billed_overage BOOLEAN DEFAULT FALSE,
      overage_amount NUMERIC(10,2) DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS corrections (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      query TEXT,
      original TEXT,
      corrected TEXT,
      jurisdiction TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)
  console.log('DB tables initialised')
}

// Plan document limits
const PLAN_LIMITS = {
  free: 3,
  solo: 50,
  team: 200,
  enterprise: 500
}

// Plan seat limits
const SEAT_LIMITS = {
  free: 1,
  solo: 1,
  team: 4,
  enterprise: 10
}

const OVERAGE_PRICE_DOC = 5.00      // $5 per extra document
const OVERAGE_PRICE_RESEARCH = 50.00 // $50 per extra research query

module.exports = { pool, initDB, PLAN_LIMITS, SEAT_LIMITS, OVERAGE_PRICE_DOC, OVERAGE_PRICE_RESEARCH }
