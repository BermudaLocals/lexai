const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const passport = require('passport');
const router = express.Router();

function getRedirectForUser(user){
  const plan=(user.plan||'').toLowerCase();
  if(plan.includes('business')) return '/business/app';
  return '/dashboard';
}

function issueSession(res,user){
  const token=jwt.sign({owner_id:user.id,email:user.email},process.env.JWT_SECRET,{expiresIn:'7d'});
  res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'Lax',path:'/',maxAge:604800000});
  res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'Lax',domain:'.lexai.llc',path:'/',maxAge:604800000});
  return token;
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

/* One-time offer login (WarriorPlus buyer provisioning).
   Exchanges a single-use login token for a session, then sends new buyers
   to the forced set-password flow. Token is passed via ?token= like the
   OAuth callback, which dashboard/set-password pages store to localStorage. */
router.get('/offer-login', async (req,res)=>{
  try{
    const raw=String(req.query.token||'');
    if(!raw) return res.redirect('/login?error=offer_token');
    const tokenHash=crypto.createHash('sha256').update(raw).digest('hex');
    const r=await pool.query(
      `UPDATE login_tokens SET used_at=NOW()
       WHERE token_hash=$1 AND used_at IS NULL AND expires_at>NOW()
       RETURNING user_id`,
      [tokenHash]
    );
    const tok=r.rows[0];
    if(!tok) return res.redirect('/login?error=offer_token');
    const u=await pool.query('SELECT * FROM users WHERE id=$1 LIMIT 1',[tok.user_id]);
    const user=u.rows[0];
    if(!user) return res.redirect('/login?error=offer_token');
    const token=issueSession(res,user);
    const dest=user.must_set_password?'/set-password':'/dashboard';
    console.log('OFFER LOGIN',user.email,'->',dest);
    res.redirect(dest+'?token='+token);
  }catch(e){console.error('OFFER LOGIN ERROR',e); res.redirect('/login?error=offer_token');}
});

router.post('/set-password', requireAuth, async (req,res)=>{
  try{
    const password=String(req.body.password||'');
    if(password.length<8) return res.status(400).json({error:'Password must be at least 8 characters'});
    const hash=await bcrypt.hash(password,10);
    await pool.query('UPDATE users SET password_hash=$1, must_set_password=false WHERE id=$2',[hash,req.user.id]);
    res.json({ok:true, redirect:'/dashboard'});
  }catch(e){console.error('SET PASSWORD ERROR',e); res.status(500).json({error:'set password failed'});}
});

module.exports = router;
