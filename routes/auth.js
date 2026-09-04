const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('../db');
const passport = require('passport');
const router = express.Router();

function getRedirectForUser(user){
  const plan=(user.plan||'').toLowerCase();
  if(plan.includes('business')) return '/business/app';
  return '/dashboard';
}

router.post('/login', async (req,res)=>{
  try{
    const cleanEmail=(req.body.email||'').toLowerCase().trim();
    const r=await pool.query('SELECT * FROM users WHERE email=$1 LIMIT 1',[cleanEmail]);
    const user=r.rows[0];
    if(!user) return res.status(401).json({error:'Invalid'});
    const ok=await bcrypt.compare(req.body.password, user.password_hash||'');
    if(!ok) return res.status(401).json({error:'Invalid'});
    const token=jwt.sign({owner_id:user.id,email:user.email},process.env.JWT_SECRET,{expiresIn:'7d'});
    res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'Lax',path:'/',maxAge:604800000});
    res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'Lax',domain:'.lexai.llc',path:'/',maxAge:604800000});
    res.json({ok:true, redirect: getRedirectForUser(user)});
  }catch(e){console.error('LOGIN ERROR',e); res.status(500).json({error:'login failed'});}
});

router.get('/google', passport.authenticate('google',{scope:['profile','email']}));

router.get('/google/callback',
  passport.authenticate('google',{failureRedirect:'/login?error=google_failed',session:false}),
  async (req,res)=>{
    const token=jwt.sign({owner_id:req.user.id,email:req.user.email},process.env.JWT_SECRET,{expiresIn:'7d'});
    res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'Lax',path:'/',maxAge:604800000});
    res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'Lax',domain:'.lexai.llc',path:'/',maxAge:604800000});
    const redirect=getRedirectForUser(req.user);
    console.log('GOOGLE',req.user.email,req.user.plan,'->',redirect);
    res.redirect(redirect);
  }
);

router.get('/logout',(req,res)=>{
  res.clearCookie('token',{path:'/'});
  res.clearCookie('token',{domain:'.lexai.llc',path:'/'});
  res.redirect('/login');
});

module.exports = router;
