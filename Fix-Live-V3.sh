#!/bin/bash
set -e
cd /root/lexai-app
echo "=== Fixing files ==="
git checkout e35ab22 -- routes/payments.js

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
ENDOFFILE

cat > routes/auth.js <<'ENDOFFILE'
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db.js');
const router = express.Router();
router.post('/login', async (req,res)=>{
  try{
    const cleanEmail = (req.body.email||'').toLowerCase().trim();
    res.clearCookie('token',{domain:'.lexai.llc',path:'/',secure:true,sameSite:'None'});
    res.clearCookie('token',{path:'/'});
    const [rows]=await db.query('SELECT * FROM users WHERE email=? LIMIT 1',[cleanEmail]);
    const user=rows[0]; if(!user) return res.status(401).json({error:'Invalid'});
    const ok=await bcrypt.compare(req.body.password, user.password_hash||user.password||''); if(!ok) return res.status(401).json({error:'Invalid'});
    const token=jwt.sign({owner_id:user.owner_id,email:user.email},process.env.JWT_SECRET,{expiresIn:'7d'});
    res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'None',domain:'.lexai.llc',path:'/',maxAge:604800000});
    res.json({token,owner_id:user.owner_id,email:user.email});
  }catch(e){ console.error(e); res.status(500).json({error:'login failed'}); }
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
const db = require('../config/db.js');
const router = express.Router();
router.get('/', authenticate, async (req,res)=>{
  try{
    const ownerId = req.user.owner_id;
    const [rows] = await db.query('SELECT owner_id,email,firm_credits,seats,plan FROM users WHERE owner_id=? LIMIT 1',[ownerId]);
    if(!rows[0]) return res.status(404).json({error:'not found'});
    res.json({ owner_id: rows[0].owner_id, email: rows[0].email, firm_credits: rows[0].firm_credits??0, seats: rows[0].seats, plan: rows[0].plan });
  }catch(e){ console.error(e); res.status(500).json({error:'status failed'}); }
});
module.exports = router;
ENDOFFILE

echo "=== Files fixed, verify ==="
ls -lh middleware/auth.js routes/auth.js routes/status.js routes/payments.js

echo "=== Rebuild Docker - correct syntax ==="
docker rm -f lexai-app || true
docker build -t lexai-app:latest .
docker run -d --name lexai-app -p 3006:3000 --env-file .env --restart always lexai-app:latest

echo "=== Logs ==="
sleep 3
docker logs lexai-app --tail 30

echo "=== Push to Railway ==="
git add -f middleware/auth.js routes/auth.js routes/status.js routes/payments.js
git commit -m "fix LIVE v3.2 - CommonJS fixes 502" || true
git push origin main
railway up --detach

echo "=== Test business page ==="
sleep 5
curl -I https://www.lexai.llc/business
curl -s https://www.lexai.llc/api/status; echo ""
