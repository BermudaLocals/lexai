const router = require('express').Router()
router.get('/google', (req, res) => res.send('Google OAuth placeholder'))
router.get('/google/callback', (req, res) => res.redirect('/dashboard'))
module.exports = router