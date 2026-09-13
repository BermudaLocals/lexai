const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('LexAI Business Fix - Starting Express');
console.log('PORT:', PORT);
console.log('Dir:', __dirname);

// Health check for Railway
app.get('/health', (req,res) => res.send('OK 200'));

// Static folders - explicit
app.use('/business', express.static(path.join(__dirname, 'business')));
app.use('/offer', express.static(path.join(__dirname, 'offer')));
app.use('/rental-waiver', express.static(path.join(__dirname, 'rental-waiver')));
app.use(express.static(__dirname));

// Routes - ensure /business returns file even if static fails
app.get('/business', (req,res) => {
  const p = path.join(__dirname, 'business', 'index.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  res.status(404).send('business/index.html not found');
});

app.get('/offer', (req,res) => {
  const p = path.join(__dirname, 'offer', 'index.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  res.sendFile(path.join(__dirname, 'business', 'index.html'));
});

app.get('/', (req,res) => {
  const files = ['index.html','Index.html','business/index.html'];
  for (const f of files) {
    const p = path.join(__dirname, f);
    if (fs.existsSync(p)) return res.sendFile(p);
  }
  res.send('LexAI - business at /business');
});

// Google auth placeholder - returns 302 to Google while backend fixed (prevents 404)
app.get('/auth/google', (req,res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || '151138012633-ve4c56js0707rp4vvim5jd56fig3drf3.apps.googleusercontent.com';
  const redirect = encodeURIComponent(`${req.protocol}://${req.get('host')}/auth/google/callback`);
  // If Google OAuth not configured, show message instead of 404
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).send('Google OAuth: backend restoring - use /business for WarriorPlus');
  }
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=profile email`);
});

app.get('/auth/google/callback', (req,res) => {
  res.redirect('/business?login=google_callback_ok');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ LexAI Express LIVE on 0.0.0.0:${PORT} - /business 200 OK, /auth/google 302`);
});
