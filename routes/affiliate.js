const express = require('express');
const router = express.Router();
let openai = null;
try {
  const OpenAI = require('openai');
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key-for-build' });
} catch(e){ console.log('OpenAI init skipped:', e.message); }
router.get('/status', (req,res)=>{ res.json({ ok:true }); });
module.exports = router;
