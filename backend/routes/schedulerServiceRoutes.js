const express = require('express');
const schedulerController = require('../controllers/schedulerServiceController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// You can uncomment this once authentication is properly set up
// router.use(authMiddleware);

// POST /api/scheduler/event - schedule a single event
router.post('/event', schedulerController.scheduleEvent);

// POST /api/scheduler/batch - schedule multiple events
router.post('/batch', schedulerController.batchSchedule);

module.exports = router;