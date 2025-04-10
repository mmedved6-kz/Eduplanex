const express = require('express');
const constraintController = require('../controllers/constraintController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// You can uncomment this once authentication is properly set up
// router.use(authMiddleware);

// POST /api/constraints/check - check constraints for an event
router.post('/check', constraintController.checkConstraints);

// GET /api/constraints - get all constraints
router.get('/', constraintController.getConstraints);

router.get('/violations', constraintController.getViolations);

module.exports = router;