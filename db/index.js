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
      role TEXT DEFAULT 'user',
      queries_used INTEGER DEFAULT 0,
      documents_used INTEGER DEFAULT 0,
      docs_used_this_month INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS docs_used_this_month INTEGER DEFAULT 0`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS session (
      sid VARCHAR NOT NULL COLLATE "default",
      sess JSON NOT NULL,
      expire TIMESTAMP(6) NOT NULL,
      PRIMARY KEY (sid)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      title TEXT,
      type TEXT,
      content TEXT,
      status TEXT DEFAULT 'draft',
      word_count INTEGER DEFAULT 0,
      jurisdiction TEXT DEFAULT 'General',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS evidence (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      case_id TEXT,
      filename TEXT,
      sha256 TEXT,
      prev_hash TEXT,
      chain_hash TEXT,
      file_size INTEGER,
      status TEXT DEFAULT 'Admissible',
      uploaded_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      plan TEXT,
      status TEXT DEFAULT 'pending',
      paypal_subscription_id TEXT,
      started_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT,
      action TEXT,
      resource TEXT,
      resource_id TEXT,
      meta JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  // Curated Commonwealth case digests (Nigeria first) — LexAI's proprietary
  // corpus. Unlike the external case-law APIs (US/UK/Caribbean only), this is
  // searched locally and blended into results by services/caselaw.js.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS case_digests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      case_name TEXT NOT NULL,
      citation TEXT NOT NULL,
      citation_norm TEXT UNIQUE,
      issue TEXT,
      facts TEXT,
      principle TEXT,
      held TEXT,
      per_judge TEXT,
      other_citations TEXT[] DEFAULT '{}',
      source TEXT,
      jurisdiction TEXT DEFAULT 'Nigeria',
      court TEXT,
      area_of_law TEXT[] DEFAULT '{}',
      year INTEGER,
      verified BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  // Full-text index using core Postgres — no pgvector / pg_trgm extension
  // required, so it can't fail on a managed DB. Expression index over the
  // searchable fields; matches the query in services/caselaw.js exactly.
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_case_digests_fts ON case_digests
    USING GIN (to_tsvector('english',
      coalesce(case_name,'') || ' ' || coalesce(issue,'') || ' ' ||
      coalesce(principle,'') || ' ' || coalesce(held,'') || ' ' || coalesce(facts,'')))
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_case_digests_jur ON case_digests(LOWER(jurisdiction))`);
  console.log('✅ Database connected and tables verified');
}

async function ensurePasswordColumn() {
  if (!pool) return;
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`);
}

module.exports = { pool, initDB, ensurePasswordColumn };
