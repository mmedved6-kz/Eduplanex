// middleware/roleMiddleware.js
const roleMiddleware = (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Access denied. Not authenticated' });
      }
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied. Not authorized' });
      }
      
      next();
    };
  };
  
  module.exports = roleMiddleware;