const db = require('../config/db');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwtConfig');

const login = async (req, res) => {
    const { email, password } = req.body;
    console.log('--- Login Attempt ---'); // Log start
    console.log('Received Email:', email);
    console.log('Received Password:', password); // Log input password

    if (!email || !password) {
        console.log('Validation Failed: Email or password missing.');
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        console.log('Querying database for user:', email);
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        console.log('Raw DB Result:', result);
        const user = result[0];

        if (!user) {
            console.log('Database Result: User not found.');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Database Result: User found:', user); 
        console.log('Password from DB:', `"${user.password}"`); 
        console.log('Password from Request:', `"${password}"`); 

        // Direct string comparison
        const isMatch = (password === user.password);
        console.log('Password Comparison Result (isMatch):', isMatch); 
        if (!isMatch) {
            console.log('Password mismatch detected.');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // If passwords match, continue below 
        console.log('Passwords matched. Proceeding with profile lookup and JWT generation.');

        // Determine profile ID based on role
        let profileId = null;
        if (user.role === 'staff' && user.staff_id) {
            profileId = user.staff_id;
            // To verify staff profile exists
            // const staffRes = await db.query('SELECT id FROM staff WHERE id = $1', [profileId]);
            // if (staffRes.rows.length === 0) throw new Error('Staff profile not found for user');
        } else if (user.role === 'student' && user.student_id) {
            profileId = user.student_id;
            // To verify student profile exists
            // const studentRes = await db.query('SELECT id FROM students WHERE id = $1', [profileId]);
            // if (studentRes.rows.length === 0) throw new Error('Student profile not found for user');
        } else if (user.role === 'admin') {
            profileId = user.id; // Or null, or a specific admin profile ID if you have one
        }

        console.log(`Determined Profile ID: ${profileId} for role: ${user.role}`);


        // Generate JWT token
        const payload = {
            userId: user.id,
            role: user.role,
            profileId: profileId 
        };

        const token = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
        console.log('JWT Token generated.');

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profileId: profileId
            }
        });
        console.log('--- Login Successful ---');

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
};

const getCurrentUser = async (req, res) => {
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const result = await db.query('SELECT id, email, role, staff_id, student_id FROM users WHERE id = $1', [req.user.userId]);
        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        let profileId = req.user.profileId;
      
        res.json({
            id: user.id,
            email: user.email,
            role: user.role,
            profileId: profileId
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
  
module.exports = {
    login,
    getCurrentUser,
};