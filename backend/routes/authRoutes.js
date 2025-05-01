const express = require('express');
const router = express.Router();
// const db = require('../config/db');
// const bcrypt = require('bcryptjs');

const authController = require('../controllers/authController');

router.post('/login', authController.login);

/** 
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await db.oneOrNone('SELECT * FROM Staff WHERE email = $1', [email]);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if password matches (assuming passwords are stored hashed)
        // For development, you might skip this check initially
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
             return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // For simplicity, let's use plain password comparison for now
        //if (password !== user.password) {
        //    return res.status(401).json({ error: 'Invalid credentials' });
        //}

        // Determine role based on your schema
        let role = "staff";  // Default role
        if (user.is_admin) {
            role = "admin";
        }

        // Return user data
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
*/

module.exports = router;