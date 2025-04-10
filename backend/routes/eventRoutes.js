const express = require('express');
const eventController = require('../controllers/eventController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

//router.use(authMiddleware);

// GET /api/events
router.get('/', eventController.getAllEvents);

router.get('/calendar', eventController.getCalendarEvents);

// GET /api/events/:id
router.get('/:id', eventController.getEventById);

// GET /api/events/:id/students
router.get('/:id/students', eventController.getEventStudents);

// POST /api/events
router.post('/', eventController.createEvent);

// PUT /api/events/:id
router.put('/:id', eventController.updateEvent);

// DELETE /api/events/:id
router.delete('/:id', eventController.deleteEvent);

module.exports = router;