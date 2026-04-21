const pg = require('pg')

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
})

async function initDB() {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  No DATABASE_URL set — skipping DB init')
    return
  }
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        avatar_url TEXT,
        provider TEXT DEFAULT 'local',
        provider_id TEXT,
        plan TEXT DEFAULT 'free',
        docs_used_this_month INT DEFAULT 0,
        firm_name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        title TEXT,
        type TEXT,
        status TEXT DEFAULT 'draft',
        content TEXT,
        word_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS analyses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        title TEXT,
        type TEXT,
        risk_score INT,
        result JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS workflows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        name TEXT,
        run_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS agents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        type TEXT,
        run_count INT DEFAULT 0,
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        user_id INT,
        action TEXT,
        resource_type TEXT,
        resource_id TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS user_corrections (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        original TEXT,
        correction TEXT,
        context TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    console.log('✅ Database initialized')
  } catch (e) {
    console.error('DB init error:', e.message)
  }
}

module.exports = { pool, initDB }
