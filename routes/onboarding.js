const express = require('express');
const router = express.Router();

// GET /api/onboarding/config - returns trial persona slides
router.get('/config', (req, res) => {
  res.json({
    success: true,
    personas: [
      { id: 'solo', name: 'Solo Creator' },
      { id: 'startup', name: 'Startup' },
      { id: 'agency', name: 'Agency' }
    ],
    trialDays: 7
  });
});

// POST /api/onboarding/complete
router.post('/complete', (req, res) => {
  res.json({ success: true });
});

module.exports = router;
