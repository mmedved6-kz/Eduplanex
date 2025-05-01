const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwtConfig');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, jwtConfig.secret);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired.' });
        }
        
        res.status(400).json({ error: 'Invalid token. '})
    }
};

module.exports = authMiddleware;