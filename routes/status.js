const express = require('express');
const db = require('../config/db.js');
const { authenticate } = require('../middleware/auth.js');
const router = express.Router();

router.get('/status', authenticate, async (req,res)=>{
  try{
    const [rows]=await db.query('SELECT firm_credits, seats FROM users WHERE owner_id=? LIMIT 1',[req.user.owner_id]);
    res.json({ firm_credits: rows[0]?.firm_credits?? 0, seats: rows[0]?.seats?? 0 });
  }catch(e){ console.error(e); res.status(500).json({error:'status failed'}); }
});

module.exports = router;
