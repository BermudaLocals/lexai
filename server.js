const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('LexAI v4 - Root lawyer, /business WarriorPlus');
console.log('PORT', PORT);

app.get('/health', (req, res) => res.send('OK'));

// Static for business
app.use('/business', express.static(path.join(__dirname, 'business')));
app.use('/offer', express.static(path.join(__dirname, 'offer')));
app.use('/rental-waiver', express.static(path.join(__dirname, 'rental-waiver')));

// ROOT - lawyer standalone - serve public/index.html or root Index.html
app.get('/', (req, res) => {
  const rootCandidates = [
    path.join(__dirname, 'public', 'index.html'),
    path.join(__dirname, 'Index.html'),
    path.join(__dirname, 'index.html')
  ];
  for (const p of rootCandidates) {
    if (fs.existsSync(p)) {
      console.log('Root serving', p);
      return res.sendFile(p);
    }
  }
  res.send('LexAI - see /business for Business offer');
});

app.get('/business', (req, res) => {
  const p = path.join(__dirname, 'business', 'index.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  res.status(404).send('business/index.html missing');
});

// Static fallback for everything else
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Auth - keep 302 not 404
app.get('/auth/google', (req, res) => {
  const cid = process.env.GOOGLE_CLIENT_ID || '151138012633-ve4c56js0707rp4vvim5jd56fig3drf3.apps.googleusercontent.com';
  const cb = 'https://lexai.llc/auth/google/callback';
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.log('Google OAuth no env, sending 503 placeholder');
    return res.status(503).send('Google OAuth restoring - business live at /business');
  }
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=' + cid + '&redirect_uri=' + encodeURIComponent(cb) + '&response_type=code&scope=profile email';
  res.redirect(url);
});

app.get('/auth/google/callback', (req, res) => res.redirect('/?login=ok'));

app.listen(PORT, '0.0.0.0', () => console.log('LIVE on', PORT, '- / = lawyer public/index.html, /business = WarriorPlus'));
