'use strict';
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits:{ fileSize: 100*1024*1024 } });

// Create firm — 5 min like Harvey 20 min
router.post('/firms', requireAuth, async (req,res)=>{
  try{
    const { name, seats=5 } = req.body;
    if(!name) return res.status(400).json({error:'name required'});
    if(seats<5) return res.status(400).json({error:'Firm min 5 seats — Harvey model'});
    const plan = seats>=20?'enterprise':'firm';
    const credits = seats*100; // 100 per seat
    const r = await pool.query(
      `INSERT INTO firms (name, owner_id, seats, plan, credits, storage_gb, billing_cycle)
       VALUES ($1,$2,$3,$4,$5,10,'annual') RETURNING *`,
      [name, req.user.id, seats, plan, credits]
    );
    await pool.query('INSERT INTO firm_members (firm_id,user_id,role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',[r.rows[0].id, req.user.id,'admin']);
    await pool.query('UPDATE users SET firm_id=$1 WHERE id=$2',[r.rows[0].id, req.user.id]);
    res.json(r.rows[0]);
  }catch(e){ console.error(e); res.status(500).json({error:e.message}); }
});
router.post('/firms/create', requireAuth, (req,res)=>{ req.url='/firms'; router.handle(req,res); });

// List + members + seats upgrade
router.get('/firms/:id', requireAuth, async (req,res)=>{
  const r = await pool.query('SELECT * FROM firms WHERE id=$1',[req.params.id]);
  if(!r.rows[0]) return res.status(404).json({error:'not found'});
  res.json(r.rows[0]);
});

router.get('/firms/:id/members', requireAuth, async (req,res)=>{
  const r = await pool.query(`SELECT u.id,u.email,fm.role FROM firm_members fm JOIN users u ON u.id=fm.user_id WHERE fm.firm_id=$1`,[req.params.id]);
  res.json({members:r.rows});
});

router.post('/firms/:id/invite', requireAuth, async (req,res)=>{
  const { email } = req.body;
  const u = await pool.query('SELECT id FROM users WHERE email=$1',[email]);
  if(!u.rows[0]) return res.status(404).json({error:'User not found — they must sign up at lexai.llc first'});
  const f = await pool.query('SELECT seats FROM firms WHERE id=$1',[req.params.id]);
  const m = await pool.query('SELECT COUNT(*) FROM firm_members WHERE firm_id=$1',[req.params.id]);
  if(parseInt(m.rows[0].count) >= f.rows[0].seats) return res.status(400).json({error:`Seat limit ${f.rows[0].seats} reached — upsell seats`});
  await pool.query('INSERT INTO firm_members (firm_id,user_id,role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',[req.params.id, u.rows[0].id,'member']);
  await pool.query('UPDATE users SET firm_id=$1 WHERE id=$2',[req.params.id, u.rows[0].id]);
  res.json({ok:true});
});

router.post('/firms/:id/seats', requireAuth, async (req,res)=>{
  const { seats } = req.body;
  if(seats<5) return res.status(400).json({error:'min 5'});
  const add = seats - (await pool.query('SELECT seats FROM firms WHERE id=$1',[req.params.id])).rows[0].seats;
  await pool.query('UPDATE firms SET seats=$1, credits=credits+$2, plan=$3 WHERE id=$4',[seats, add*100, seats>=20?'enterprise':'firm', req.params.id]);
  if(add>0) await pool.query('INSERT INTO overage_log (firm_id,type,cost) VALUES ($1,$2,$3)',[req.params.id,'seat_upgrade',add*59]); // $59 per extra seat/mo
  const r = await pool.query('SELECT * FROM firms WHERE id=$1',[req.params.id]);
  res.json(r.rows[0]);
});

// Business portal
router.get('/business-portal/firms', requireAuth, async (req,res)=>{
  const r = await pool.query(`SELECT f.*, u.email as owner_email FROM firms f LEFT JOIN users u ON u.id=f.owner_id ORDER BY f.created_at DESC`);
  res.json({firms:r.rows});
});
router.get('/business-portal/leads', requireAuth, async (req,res)=>{
  const r = await pool.query(`SELECT * FROM firms WHERE plan='firm' ORDER BY created_at DESC`);
  res.json(r.rows);
});
router.get('/business-portal/overage', requireAuth, async (req,res)=>{
  const r = await pool.query(`SELECT ol.*, f.name as firm_name FROM overage_log ol LEFT JOIN firms f ON f.id=ol.firm_id ORDER BY ol.created_at DESC LIMIT 200`);
  res.json({overage:r.rows});
});

// Vault $99/10GB
router.post('/vault/upload', requireAuth, upload.single('file'), async (req,res)=>{
  if(!req.file) return res.status(400).json({error:'no file'});
  const gb = req.file.size/1e9;
  const u = await pool.query('SELECT storage_used_gb, firm_id FROM users WHERE id=$1',[req.user.id]);
  const used = parseFloat(u.rows[0]?.storage_used_gb||0);
  const firm_id = u.rows[0]?.firm_id;
  if(used+gb>10 && firm_id){
    await pool.query('INSERT INTO overage_log (firm_id,user_id,type,cost) VALUES ($1,$2,$3,99)',[firm_id, req.user.id,'storage']);
  }
  await pool.query('UPDATE users SET storage_used_gb=COALESCE(storage_used_gb,0)+$1 WHERE id=$2',[gb, req.user.id]);
  res.json({ok:true,size_gb:gb,billed:used+gb>10});
});

module.exports = router;
