import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
const router = express.Router();
router.post('/login', async (req,res)=>{
  const cleanEmail = (req.body.email||'').toLowerCase().trim();
  res.clearCookie('token',{domain:'.lexai.llc',path:'/',secure:true,sameSite:'None'});
  res.clearCookie('token',{path:'/'});
  const [rows]=await db.query('SELECT * FROM users WHERE email=? LIMIT 1',[cleanEmail]);
  const user=rows[0]; if(!user) return res.status(401).json({error:'Invalid'});
  const ok=await bcrypt.compare(req.body.password, user.password_hash||user.password||''); if(!ok) return res.status(401).json({error:'Invalid'});
  const token=jwt.sign({owner_id:user.owner_id,email:user.email},process.env.JWT_SECRET,{expiresIn:'7d'});
  res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'None',domain:'.lexai.llc',path:'/',maxAge:604800000});
  res.json({token,owner_id:user.owner_id,email:user.email});
});
router.post('/logout',(req,res)=>{
  res.clearCookie('token',{domain:'.lexai.llc',path:'/',secure:true,sameSite:'None'});
  res.clearCookie('token',{path:'/'});
  res.json({ok:true});
});
export default router;
