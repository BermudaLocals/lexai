#!/usr/bin/env node
/* Manual test for WarriorPlus IPN provisioning — Offer 94697.
   Runs the real IPN + auth routers against an in-memory fake db (no
   production DB needed). Usage: node scripts/test-ipn.js */
'use strict';

process.env.JWT_SECRET = 'test-jwt-secret';
process.env.WPLUS_SECRET = 'test-wplus-secret';

const assert = require('assert');
const crypto = require('crypto');
const express = require('express');

/* ── In-memory fake db (matches the SQL shapes used by the routers) ── */
const db = { users: [], wplus_sales: new Map(), login_tokens: [] };
let userSeq = 0;

function query(text, params = []) {
  const sql = String(text).replace(/\s+/g, ' ').trim().toLowerCase();

  if (sql === 'begin' || sql === 'commit' || sql === 'rollback') return Promise.resolve({ rows: [] });
  if (sql.startsWith('create ') || sql.startsWith('alter ')) return Promise.resolve({ rows: [] });

  if (sql.includes('insert into wplus_sales')) {
    const [txn_id, email, product_id, docs] = params;
    if (db.wplus_sales.has(txn_id)) return Promise.resolve({ rows: [] }); // ON CONFLICT DO NOTHING
    db.wplus_sales.set(txn_id, { txn_id, email, product_id, docs, user_id: null });
    return Promise.resolve({ rows: [{ txn_id }] });
  }
  if (sql.includes('update wplus_sales')) {
    const [user_id, txn_id] = params;
    const s = db.wplus_sales.get(txn_id);
    if (s) s.user_id = user_id;
    return Promise.resolve({ rows: [] });
  }
  if (sql.includes('insert into users')) {
    const [email, name, password_hash, plan, docs_credits] = params;
    if (db.users.some(u => u.email === email)) return Promise.resolve({ rows: [] }); // ON CONFLICT DO NOTHING
    const user = {
      id: 'user-' + (++userSeq), email, name, password_hash, plan,
      role: 'user', provider: 'email', docs_credits, docs_used_this_month: 0,
      must_set_password: true, firm_id: null
    };
    db.users.push(user);
    return Promise.resolve({ rows: [user] });
  }
  if (sql.includes('update users set docs_credits')) {
    const [docs, id] = params;
    const u = db.users.find(x => x.id === id);
    if (!u) return Promise.resolve({ rows: [] });
    u.docs_credits = (u.docs_credits || 0) + docs;
    if (sql.includes('must_set_password')) {
      u.must_set_password = Boolean(u.must_set_password) || u.password_hash == null;
    }
    return Promise.resolve({ rows: [{ docs_credits: u.docs_credits }] });
  }
  if (sql.includes('update users set password_hash')) {
    const [hash, id] = params;
    const u = db.users.find(x => x.id === id);
    if (u) { u.password_hash = hash; u.must_set_password = false; }
    return Promise.resolve({ rows: [] });
  }
  if (sql.includes('insert into login_tokens')) {
    const [user_id, token_hash] = params;
    db.login_tokens.push({ user_id, token_hash, expires_at: Date.now() + 24 * 3600 * 1000, used_at: null });
    return Promise.resolve({ rows: [] });
  }
  if (sql.includes('update login_tokens')) {
    const [token_hash] = params;
    const t = db.login_tokens.find(x => x.token_hash === token_hash && !x.used_at && x.expires_at > Date.now());
    if (!t) return Promise.resolve({ rows: [] });
    t.used_at = Date.now();
    return Promise.resolve({ rows: [{ user_id: t.user_id }] });
  }
  if (sql.includes('select * from users where email')) {
    const u = db.users.find(x => x.email === params[0]);
    return Promise.resolve({ rows: u ? [u] : [] });
  }
  if (sql.includes('select * from users where id')) {
    const u = db.users.find(x => x.id === params[0]);
    return Promise.resolve({ rows: u ? [u] : [] });
  }
  throw new Error('fake db: unmatched SQL: ' + sql);
}

const fakePool = {
  query,
  connect: async () => ({ query, release: () => {} })
};

// Inject the fake db BEFORE any router can require the real one.
const dbPath = require.resolve('../db');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: { pool: fakePool, initDB: async () => {}, ensurePasswordColumn: async () => {} } };

const ipnRouter = require('../routes/warriorplus-ipn');
const authRouter = require('../routes/auth');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/webhook', ipnRouter);
app.use('/auth', authRouter);

/* ── Test runner ── */
const results = [];
function check(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => { results.push(['PASS', name]); console.log('  PASS', name); })
    .catch(e => { results.push(['FAIL', name + ' — ' + e.message]); console.log('  FAIL', name, '—', e.message); });
}

async function main() {
  const server = app.listen(0);
  await new Promise(r => server.once('listening', r));
  const base = 'http://127.0.0.1:' + server.address().port;
  const post = (path, body) => fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(r => r.json());

  let loginUrl = null;
  let rawToken = null;

  await check('new buyer (473669 BASIC) → account created with 10 credits + loginUrl', async () => {
    const r = await post('/webhook/warriorplus-ipn', {
      txn_id: 'TXN-1', product_id: '473669',
      customer_email: 'Buyer1@Example.com', customer_name: 'Buyer One',
      WP_SECRET: 'test-wplus-secret'
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.action, 'created');
    assert.strictEqual(r.docs, 10);
    assert.strictEqual(r.docs_credits, 10);
    assert.ok(r.loginUrl && r.loginUrl.includes('/auth/offer-login?token='), 'loginUrl has token');
    loginUrl = r.loginUrl;
    rawToken = loginUrl.split('token=')[1];
    const u = db.users.find(x => x.email === 'buyer1@example.com');
    assert.ok(u, 'user exists (email lowercased)');
    assert.strictEqual(u.docs_credits, 10);
    assert.strictEqual(u.must_set_password, true);
    assert.strictEqual(u.plan, 'business_basic');
    assert.ok(u.password_hash && u.password_hash.startsWith('$2'), 'temp password hashed');
  });

  await check('idempotency: same txn_id again → duplicate, no double credit', async () => {
    const r = await post('/webhook/warriorplus-ipn', {
      txn_id: 'TXN-1', product_id: '473669',
      customer_email: 'buyer1@example.com', WP_SECRET: 'test-wplus-secret'
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.action, 'duplicate');
    assert.strictEqual(r.docs_credited, 0);
    assert.strictEqual(db.users.find(x => x.email === 'buyer1@example.com').docs_credits, 10);
  });

  await check('existing buyer top-up (473682 SOLO) → 10 + 40 = 50 credits', async () => {
    const r = await post('/webhook/warriorplus-ipn', {
      txn_id: 'TXN-2', product_id: '473682',
      buyer_email: 'buyer1@example.com', WP_SECRET: 'test-wplus-secret'
    });
    assert.strictEqual(r.action, 'topped_up');
    assert.strictEqual(r.docs_credited, 40);
    assert.strictEqual(r.docs_credits, 50);
  });

  await check('unknown product_id → 200, ignored, credits nothing', async () => {
    const r = await post('/webhook/warriorplus-ipn', {
      txn_id: 'TXN-3', product_id: '999999',
      customer_email: 'nobody@example.com', WP_SECRET: 'test-wplus-secret'
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.ignored, true);
    assert.strictEqual(r.reason, 'unknown_product');
    assert.ok(!db.users.some(x => x.email === 'nobody@example.com'), 'no user created');
    assert.ok(!db.wplus_sales.has('TXN-3'), 'no sale recorded');
  });

  await check('secret mismatch → ok:false, credits nothing', async () => {
    const r = await post('/webhook/warriorplus-ipn', {
      txn_id: 'TXN-4', product_id: '473683',
      customer_email: 'attacker@example.com', WP_SECRET: 'wrong-secret'
    });
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.error, 'secret_mismatch');
    assert.ok(!db.users.some(x => x.email === 'attacker@example.com'));
  });

  await check('WPLUS_SECRET unset → verification disabled (still provisions)', async () => {
    delete process.env.WPLUS_SECRET;
    const r = await post('/webhook/warriorplus-ipn', {
      txn_id: 'TXN-5', product_id: '473683',
      customer_email: 'team@example.com'
    });
    process.env.WPLUS_SECRET = 'test-wplus-secret';
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.action, 'created');
    assert.strictEqual(r.docs_credits, 120);
  });

  await check('OAuth-only existing user top-up → forced to set password', async () => {
    db.users.push({ id: 'user-oauth', email: 'oauth@example.com', name: 'OAuth', password_hash: null, provider: 'google', plan: 'trial', role: 'user', docs_credits: null, must_set_password: false, firm_id: null });
    const r = await post('/webhook/warriorplus-ipn', {
      txn_id: 'TXN-6', product_id: '473669',
      customer_email: 'oauth@example.com', WP_SECRET: 'test-wplus-secret'
    });
    assert.strictEqual(r.action, 'topped_up');
    const u = db.users.find(x => x.email === 'oauth@example.com');
    assert.strictEqual(u.docs_credits, 10);
    assert.strictEqual(u.must_set_password, true);
  });

  await check('WP_* field names (WarriorPlus native) + form-encoded + .php path', async () => {
    const r = await fetch(base + '/webhook/warriorplus-ipn.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        WP_SALE_ID: 'TXN-7', WP_ITEM_ID: '473669',
        WP_BUYER_EMAIL: 'native@example.com', WP_SECRET: 'test-wplus-secret'
      })
    }).then(r => r.json());
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.action, 'created');
    assert.strictEqual(r.email, 'native@example.com');
    // deterministic idempotency even without txn id
    const body = { product_id: '473669', customer_email: 'notxn@example.com', amount: '49', WP_SECRET: 'test-wplus-secret' };
    const r1 = await post('/webhook/warriorplus-ipn', body);
    const r2 = await post('/webhook/warriorplus-ipn', body);
    assert.strictEqual(r1.action, 'created');
    assert.strictEqual(r2.action, 'duplicate');
    assert.ok(r1.txn_id.startsWith('auto-'));
  });

  let sessionJwt = null;

  await check('offer-login exchanges one-time token → session + set-password redirect', async () => {
    const url = new URL(loginUrl);
    const r = await fetch(base + url.pathname + url.search, { redirect: 'manual' });
    assert.strictEqual(r.status, 302);
    const loc = r.headers.get('location');
    assert.ok(loc.startsWith('/set-password?token='), 'new buyer forced to set password, got: ' + loc);
    sessionJwt = loc.split('token=')[1];
    const setCookie = r.headers.get('set-cookie') || '';
    assert.ok(setCookie.includes('token='), 'auth cookie set');
  });

  await check('offer-login token is single-use → second hit bounces to /login', async () => {
    const r = await fetch(base + '/auth/offer-login?token=' + rawToken, { redirect: 'manual' });
    assert.strictEqual(r.status, 302);
    assert.strictEqual(r.headers.get('location'), '/login?error=offer_token');
  });

  await check('set-password with session → hash stored, flag cleared', async () => {
    const r = await fetch(base + '/auth/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + sessionJwt },
      body: JSON.stringify({ password: 'NewPass123!' })
    }).then(r => r.json());
    assert.strictEqual(r.ok, true);
    const u = db.users.find(x => x.email === 'buyer1@example.com');
    assert.strictEqual(u.must_set_password, false);
    const bcrypt = require('bcrypt');
    assert.ok(await bcrypt.compare('NewPass123!', u.password_hash), 'new password verifies');
  });

  await check('buyer can now log in with the new password', async () => {
    const r = await post('/auth/login', { email: 'buyer1@example.com', password: 'NewPass123!' });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.redirect, '/business/app');
  });

  server.close();
  const failed = results.filter(([s]) => s === 'FAIL');
  console.log('\n' + (results.length - failed.length) + '/' + results.length + ' tests passed');
  if (failed.length) { console.error('FAILURES:'); failed.forEach(([, n]) => console.error(' - ' + n)); process.exit(1); }
  console.log('All IPN provisioning tests passed ✓');
}

main().catch(e => { console.error(e); process.exit(1); });
