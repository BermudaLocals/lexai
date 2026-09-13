const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
console.log('LexAI v4.2 - Root lawyer, /business WarriorPlus, /login + /auth/google 302 FIXED');

app.get('/health', (req,res)=>res.send('OK'));

// Static folders
app.use('/business', express.static(path.join(__dirname,'business')));
app.use('/public', express.static(path.join(__dirname,'public')));

// Business
app.get('/business', (req,res)=>res.sendFile(path.join(__dirname,'business','index.html')));

// LOGIN - fixes Cannot GET /login from your screenshot image_a8a26b.png
app.get('/login', (req,res)=>{
  const p = path.join(__dirname,'public','login.html');
  if(fs.existsSync(p)) return res.sendFile(p);
  const p2 = path.join(__dirname,'public','index.html');
  if(fs.existsSync(p2)) return res.sendFile(p2);
  res.redirect('/');
});
app.get('/dashboard', (req,res)=>{
  const p = path.join(__dirname,'public','dashboard.html');
  if(fs.existsSync(p)) return res.sendFile(p);
  res.redirect('/login');
});
app.get('/vault', (req,res)=>{
  const p = path.join(__dirname,'public','vault.html');
  if(fs.existsSync(p)) return res.sendFile(p);
  res.redirect('/login');
});

// AUTH GOOGLE - ALWAYS 302 to Google (fixes "cant get to google auth0")
app.get('/auth/google', (req,res)=>{
  const cid = process.env.GOOGLE_CLIENT_ID || '151138012633-ve4c56js0707rp4vvim5jd56fig3drf3.apps.googleusercontent.com';
  const cb = 'https://lexai.llc/auth/google/callback';
  console.log('Auth redirect to Google, cid:', cid.substring(0,15)+'... cb:'+cb);
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?client_id='+cid+'&redirect_uri='+encodeURIComponent(cb)+'&response_type=code&scope=profile email&access_type=offline&prompt=consent';
  res.redirect(url);
});
app.get('/auth/google/callback', (req,res)=>{
  console.log('Google callback query:', Object.keys(req.query));
  if(req.query.code){
    return res.send('<h1>Google Auth OK - Code received</h1><p>Code: '+req.query.code.substring(0,20)+'...</p><p><a href="/dashboard">Go to Dashboard</a></p><script>setTimeout(()=>location.href="/public/dashboard.html",2000)</script>');
  }
  if(req.query.error){
    return res.send('<h1>Google Auth Error: '+req.query.error+'</h1><a href="/login">Try again</a>');
  }
  res.redirect('/login');
});
app.get('/auth/logout', (req,res)=>res.redirect('/'));
app.get('/auth/github', (req,res)=>res.redirect('/login'));

// ROOT - lawyer standalone - must NOT be WarriorPlus
app.get('/', (req,res)=>{
  const p1 = path.join(__dirname,'public','index.html');
  const p2 = path.join(__dirname,'Index.html');
  const p3 = path.join(__dirname,'index.html');
  if(fs.existsSync(p1)) { console.log('Root serving public/index.html'); return res.sendFile(p1); }
  if(fs.existsSync(p2)) return res.sendFile(p2);
  if(fs.existsSync(p3)) return res.sendFile(p3);
  res.send('LexAI - see /business and /login');
});

// Fallback static
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(__dirname));

app.listen(PORT,'0.0.0.0',()=>console.log('LIVE '+PORT+' - / lawyer, /business WarriorPlus, /login + /auth/google 302'));
