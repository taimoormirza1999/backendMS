const express = require('express');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}! This is your profile.` });
});

module.exports = router;
