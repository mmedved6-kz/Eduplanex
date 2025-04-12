const Timeslot = require('../models/timeslotModel');

// Get all time slots
const getAllTimeslots = async (req, res) => {
  try {
    const timeslots = await Timeslot.getAll();
    res.json({ items: timeslots });
  } catch (error) {
    console.error('Error in getAllTimeslots:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get available time slots for a given date
const getAvailableTimeslots = async (req, res) => {
  try {
    const { date, roomId, staffId, minCapacity } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }
    
    const availableSlots = await Timeslot.findAvailable(
      date,
      roomId || null,
      staffId || null,
      minCapacity ? parseInt(minCapacity) : 0
    );
    
    res.json({ items: availableSlots });
  } catch (error) {
    console.error('Error in getAvailableTimeslots:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTimeslots,
  getAvailableTimeslots
};