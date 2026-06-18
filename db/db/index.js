const pg = require('pg');

const pool = process.env.DATABASE_URL ? new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
}) : null;

async function initDB() {
  if (!pool) {
    console.warn('⚠️  No DATABASE_URL set — skipping DB init');
    return;
  }
  await pool.query('SELECT 1');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password_hash TEXT,
      avatar_url TEXT,
      provider TEXT DEFAULT 'email',
      provider_id TEXT,
      plan TEXT DEFAULT 'free',
      queries_used INTEGER DEFAULT 0,
      documents_used INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE TABLE IF NOT EXISTS session (sid VARCHAR NOT NULL COLLATE "default", sess JSON NOT NULL, expire TIMESTAMP(6) NOT NULL, PRIMARY KEY (sid))`);
  console.log('✅ Database connected');
}

module.exports = { pool, initDB };

async function ensurePasswordColumn() {
  if (!pool) return;
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`);
}
module.exports.ensurePasswordColumn = ensurePasswordColumn;

async function ensurePasswordColumn() {
  if (!pool) return;
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`);
}
module.exports.ensurePasswordColumn = ensurePasswordColumn;
