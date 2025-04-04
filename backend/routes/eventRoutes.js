const express = require('express');
const eventController = require('../controllers/eventController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

//router.use(authMiddleware);

// GET /api/events
router.get('/', eventController.getAllEvents);

// GET /api/courses/:id
router.get('/:id', eventController.getEventById);

router.get('/calendar', eventController.getCalendarEvents);

// POST /api/courses
router.post('/', eventController.createEvent);

// PUT /api/courses/:id
router.put('/:id', eventController.updateEvent);

// DELETE /api/courses/:id
router.delete('/:id', eventController.deleteEvent);

module.exports = router;