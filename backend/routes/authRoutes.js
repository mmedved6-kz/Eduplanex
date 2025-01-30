const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Validate credentials (this is a basic example; use proper validation and hashing in production)
    const user = await db.oneOrNone('SELECT * FROM Staff WHERE username = $1 AND password = $2', [username, password]);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
});

module.exports = router;