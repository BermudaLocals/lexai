#!/bin/bash
set -e
cd /root/lexai-app
echo "=== STOP bad container ==="
docker rm -f lexai-app || true

echo "=== Remove wrong mysql files ==="
rm -f config/db.js db.js
ls -la config/
ls -la db/

echo "=== Restore correct Postgres DB files from working tag ==="
git checkout e35ab22 -- db/index.js routes/payments.js
# e35ab22 had pg version
cat db/index.js | head -20

echo "=== Ensure payments.js uses pg pool, not config/db.js ==="
sed -i "s|require('../config/db.js')|require('../db')|g" routes/payments.js
sed -i "s|const pool = require|const { pool } = require|g" routes/payments.js
# If double-braced, fix
sed -i "s|{ { pool } }|{ pool }|g" routes/payments.js
head -12 routes/payments.js

echo "=== Restore correct auth files (CommonJS + no global owner) ==="
cat > middleware/auth.js <<'ENDOFFILE'
const jwt = require('jsonwebtoken');
const authenticate = (req, res, next) => {
  try {
    const token = (req.cookies && req.cookies.token) || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch(e){ return res.status(401).json({ error: 'Invalid token' }); }
};
module.exports = { authenticate };
module.exports.authenticate = authenticate;
module.exports.default = authenticate;
ENDOFFILE

cat > routes/auth.js <<'ENDOFFILE'
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const router = express.Router();
router.post('/login', async (req,res)=>{
  try{
    const cleanEmail = (req.body.email||'').toLowerCase().trim();
    res.clearCookie('token',{domain:'.lexai.llc',path:'/',secure:true,sameSite:'None'});
    res.clearCookie('token',{path:'/'});
    const result = await pool.query('SELECT * FROM users WHERE email=$1 LIMIT 1',[cleanEmail]);
    const user=result.rows[0]; if(!user) return res.status(401).json({error:'Invalid'});
    const ok=await bcrypt.compare(req.body.password, user.password_hash||''); if(!ok) return res.status(401).json({error:'Invalid'});
    const token=jwt.sign({owner_id:user.id,email:user.email},process.env.JWT_SECRET,{expiresIn:'7d'});
    res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'None',domain:'.lexai.llc',path:'/',maxAge:604800000});
    res.json({token,owner_id:user.id,email:user.email});
  }catch(e){ console.error('LOGIN ERROR',e); res.status(500).json({error:'login failed'}); }
});
router.post('/logout',(req,res)=>{
  res.clearCookie('token',{domain:'.lexai.llc',path:'/',secure:true,sameSite:'None'});
  res.clearCookie('token',{path:'/'});
  res.json({ok:true});
});
module.exports = router;
ENDOFFILE

cat > routes/status.js <<'ENDOFFILE'
const express = require('express');
const { authenticate } = require('../middleware/auth.js');
const { pool } = require('../db');
const router = express.Router();
router.get('/', authenticate, async (req,res)=>{
  try{
    const ownerId = req.user.owner_id;
    const result = await pool.query('SELECT id as owner_id,email,plan FROM users WHERE id=$1 LIMIT 1',[ownerId]);
    if(!result.rows[0]) return res.status(404).json({error:'not found'});
    res.json(result.rows[0]);
  }catch(e){ console.error(e); res.status(500).json({error:'status failed'}); }
});
module.exports = router;
ENDOFFILE

echo "=== Verify files ==="
node -c db/index.js && echo "db/index.js OK"
node -c server.js && echo "server.js OK"
node -c routes/payments.js && echo "payments.js OK"

echo "=== Rebuild Docker - CORRECT SYNTAX WITH SPACES ==="
docker build -t lexai-app:latest .
docker run -d --name lexai-app -p 3006:3000 --env-file .env --restart always lexai-app:latest
sleep 5
docker logs lexai-app --tail 40

echo "=== Push to Railway ==="
git add -f db/index.js routes/payments.js middleware/auth.js routes/auth.js routes/status.js
git rm -f config/db.js db.js 2>/dev/null || true
git commit -m "fix LIVE - remove mysql2, restore pg db/index.js - fixes 502 restart loop + account mixing" || true
git push origin main
railway up --detach

echo "=== Final test ==="
curl -I https://www.lexai.llc/business || true
curl -s https://www.lexai.llc/api/status; echo ""
