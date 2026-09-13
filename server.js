const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
console.log('LexAI Fix v3 - Root lawyer + /business WarriorPlus');
console.log('PORT:', PORT);

// Health
app.get('/health', (req,res) => res.send('OK'));

// Static folders
app.use('/business', express.static(path.join(__dirname, 'business')));
app.use('/offer', express.static(path.join(__dirname, 'offer')));
app.use('/rental-waiver', express.static(path.join(__dirname, 'rental-waiver')));

// ROOT - Lawyer standalone - MUST be original, NOT business
app.get('/', (req,res) => {
  // Try original lawyer files in order
  const candidates = [
    'index.html',
    'Index.html',
    'public/index.html',
    'lexai/index.html',
    'app/index.html'
  ];
  for (const f of candidates) {
    const p = path.join(__dirname, f);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      // Ensure it's NOT the business offer (check for .33 lawyer vs business)
      if (!content.includes('Offer 94697') && !content.includes('Starting \')) {
        console.log('Serving root:', f);
        return res.sendFile(p);
      }
    }
  }
  // Fallback if no original found - serve business but log warning
  console.log('WARNING: No original root index.html found, serving business as fallback');
  return res.sendFile(path.join(__dirname, 'business', 'index.html'));
});

// Business - WarriorPlus ONLY
app.get('/business', (req,res) => {
  res.sendFile(path.join(__dirname, 'business', 'index.html'));
});

app.get('/offer', (req,res) => {
  res.sendFile(path.join(__dirname, 'offer', 'index.html'));
});

// Serve other static files
app.use(express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Auth placeholder - keeps 302, not 404
app.get('/auth/google', (req,res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || '151138012633-ve4c56js0707rp4vvim5jd56fig3drf3.apps.googleusercontent.com';
  const redirect = encodeURIComponent(https://lexai.llc/auth/google/callback);
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).send('Google OAuth restoring - /business is live');
  }
  res.redirect(https://accounts.google.com/o/oauth2/v2/auth?client_id=&redirect_uri=&response_type=code&scope=profile email);
});
app.get('/auth/google/callback', (req,res) => res.redirect('/?login=ok'));

app.listen(PORT, '0.0.0.0', () => console.log(LIVE  - / = lawyer, /business = WarriorPlus 94697));
