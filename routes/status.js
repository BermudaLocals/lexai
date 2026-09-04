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
