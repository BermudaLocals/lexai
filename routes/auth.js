const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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
