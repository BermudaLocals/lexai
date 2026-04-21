let pool = null;
if (process.env.DATABASE_URL) {
  try {
    const pg = eval('req' + 'uire')('pg');
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20, idleTimeoutMillis: 30000,
    });
  } catch (e) { console.warn('pg not available:', e.message); }
}
module.exports = { pool };
