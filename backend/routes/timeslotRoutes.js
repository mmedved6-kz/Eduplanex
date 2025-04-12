const express = require('express');
const router = express.Router();
const timeslotController = require('../controllers/timeslotController');

// Get all time slots
router.get('/', timeslotController.getAllTimeslots);

// Get available time slots for a date
router.get('/available', timeslotController.getAvailableTimeslots);

module.exports = router;