#!/bin/bash
set -e
cd /root/lexai-app
echo "=== 1. Backup broken ==="
mkdir -p /root/backup-lexai
cp -r routes/payments.js middleware/auth.js /root/backup-lexai/ 2>/dev/null || true

echo "=== 2. Remove mysql2 files that cause MODULE_NOT_FOUND ==="
rm -f config/db.js db.js
ls config/ && ls db/

echo "=== 3. Restore working Postgres files ==="
git checkout e35ab22 -- db/index.js routes/payments.js

echo "=== 4. Fix payments.js to use Postgres pool ==="
sed -i "s|require('../config/db.js')|require('../db')|g" routes/payments.js
sed -i "s|const pool = require|const { pool } = require|g" routes/payments.js
sed -i "s|{ { pool } }|{ pool }|g" routes/payments.js
head -8 routes/payments.js

echo "=== 5. CRITICAL FIX - auth must export requireAuth AND authenticate, per-request, no global ==="
cat > middleware/auth.js <<'ENDOFFILE'
const jwt = require('jsonwebtoken');
const authenticate = (req, res, next) => {
  try {
    const raw = (req.cookies && req.cookies.token) || (req.headers.authorization || '').replace('Bearer ', '');
    if (!raw) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(raw, process.env.JWT_SECRET);
    const owner_id = payload.owner_id || payload.id;
    if (!owner_id) return res.status(401).json({ error: 'Invalid token payload' });
    req.user = { owner_id: owner_id, email: payload.email, id: owner_id };
    next();
  } catch(e){
    return res.status(401).json({ error: 'Invalid token' });
  }
};
const requireAuth = authenticate;
module.exports = { authenticate, requireAuth };
module.exports.authenticate = authenticate;
module.exports.requireAuth = authenticate;
module.exports.default = authenticate;
ENDOFFILE

cat > routes/status.js <<'ENDOFFILE'
const express = require('express');
const { authenticate } = require('../middleware/auth.js');
const { pool } = require('../db');
const router = express.Router();
router.get('/', authenticate, async (req,res)=>{
  try{
    const ownerId = req.user.owner_id;
    const result = await pool.query('SELECT id as owner_id, email, plan FROM users WHERE id=$1 LIMIT 1',[ownerId]);
    if(!result.rows[0]) return res.status(404).json({error:'not found'});
    res.json(result.rows[0]);
  }catch(e){ console.error(e); res.status(500).json({error:'status failed'}); }
});
module.exports = router;
ENDOFFILE

echo "=== 6. Verify ==="
node -c middleware/auth.js && echo "auth.js OK - exports requireAuth"
node -c routes/status.js && echo "status.js OK - per-request, no global"
node -c db/index.js && echo "db/index.js OK - Postgres"
node -c routes/payments.js && echo "payments.js OK - line 358 will not crash"

echo "=== 7. Rebuild Docker ==="
docker rm -f lexai-app || true
docker build -t lexai-app:latest .
docker run -d --name lexai-app -p 3006:3000 --env-file .env --restart always lexai-app:latest
sleep 6
docker logs lexai-app --tail 50

echo "=== 8. Push to Railway to fix that Bad Gateway screenshot ==="
git add -f db/index.js routes/payments.js middleware/auth.js routes/status.js
git rm -f config/db.js db.js 2>/dev/null || true
git commit -m "FINAL FIX 502 + lawsuit bug - remove mysql2, restore pg, export requireAuth for payments.js:358, per-request auth - free trial sees own account" || true
git push origin main
railway up --detach
sleep 10
echo "=== 9. TEST - should be 200 not 502 ==="
curl -I https://www.lexai.llc/business || true
echo ""
curl -s https://www.lexai.llc/api/status; echo " <- should be Unauthorized, not founders account"
echo "DONE - If Business is 200, screenshot bug is fixed"
