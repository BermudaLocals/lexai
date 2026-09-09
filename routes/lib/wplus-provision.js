/* WarriorPlus buyer provisioning — Offer 94697 (LexAI Business AI)
   Creates or tops up a LexAI account from a W+ sale and mints a one-time
   login token. Pool is injected so tests can run against a fake db. */
const crypto = require('crypto')
const bcrypt = require('bcrypt')

const DOCS_MAP = { '473669': 10, '473682': 40, '473683': 120 }
const PLAN_MAP = { '473669': 'business_basic', '473682': 'business_solo', '473683': 'business_larger' }

module.exports = function wplusProvision (pool) {
  async function createLexAIUser (email, docs, product_id, txn_id, name) {
    const cleanEmail = String(email || '').toLowerCase().trim()
    const txnId = String(txn_id || '').trim()
    const productId = String(product_id || '').trim()

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Idempotency: the first writer of this txn_id wins. W+ retries of the
      // same sale return 'duplicate' and credit nothing a second time.
      const sale = await client.query(
        `INSERT INTO wplus_sales (txn_id, email, product_id, docs)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (txn_id) DO NOTHING
         RETURNING txn_id`,
        [txnId, cleanEmail, productId, docs]
      )
      if (sale.rows.length === 0) {
        await client.query('COMMIT')
        return { action: 'duplicate', docs_credited: 0 }
      }

      let action = 'topped_up'
      let r = await client.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [cleanEmail])
      let user = r.rows[0]

      if (user) {
        // Existing account: top up credits, never fail. If they have no
        // password yet (OAuth-only), force one at next login.
        const u = await client.query(
          `UPDATE users
           SET docs_credits = COALESCE(docs_credits, 0) + $1,
               must_set_password = COALESCE(must_set_password, false) OR password_hash IS NULL
           WHERE id = $2
           RETURNING docs_credits`,
          [docs, user.id]
        )
        user.docs_credits = u.rows[0] ? u.rows[0].docs_credits : docs
      } else {
        // New buyer: random temp password (never shown, never logged),
        // replaced by the forced set-password flow after first login.
        action = 'created'
        const tempPassword = crypto.randomBytes(24).toString('base64url')
        const passwordHash = await bcrypt.hash(tempPassword, 10)
        const ins = await client.query(
          `INSERT INTO users (email, name, password_hash, plan, role, docs_credits, must_set_password)
           VALUES ($1, $2, $3, $4, 'user', $5, true)
           ON CONFLICT (email) DO NOTHING
           RETURNING *`,
          [cleanEmail, name || cleanEmail.split('@')[0], passwordHash, PLAN_MAP[productId] || 'business', docs]
        )
        if (ins.rows.length > 0) {
          user = ins.rows[0]
        } else {
          // Lost a concurrent create race — fall back to top-up.
          action = 'topped_up'
          r = await client.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [cleanEmail])
          user = r.rows[0]
          const u = await client.query(
            `UPDATE users SET docs_credits = COALESCE(docs_credits, 0) + $1 WHERE id = $2 RETURNING docs_credits`,
            [docs, user.id]
          )
          user.docs_credits = u.rows[0] ? u.rows[0].docs_credits : docs
        }
      }

      await client.query('UPDATE wplus_sales SET user_id = $1 WHERE txn_id = $2', [String(user.id), txnId])

      // One-time login token (24h). The raw value goes into the loginUrl;
      // only its sha256 hash is stored.
      const loginToken = crypto.randomBytes(32).toString('base64url')
      const tokenHash = crypto.createHash('sha256').update(loginToken).digest('hex')
      await client.query(
        `INSERT INTO login_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
        [String(user.id), tokenHash]
      )

      await client.query('COMMIT')
      return { action, user, loginToken, docs_credited: docs, docs_credits: user.docs_credits }
    } catch (e) {
      await client.query('ROLLBACK').catch(() => {})
      throw e
    } finally {
      client.release()
    }
  }

  return { createLexAIUser, DOCS_MAP, PLAN_MAP }
}
