const SchedulerService = require('../models/schedulerServiceModel');

/**
 * Schedule a single event with the best available room and staff
 */
const scheduleEvent = async (req, res) => {
  try {
    const eventData = req.body;
    
    // Validate required fields
    if (!eventData.title || !eventData.start || !eventData.end || !eventData.moduleId) {
      return res.status(400).json({
        error: 'Missing required fields (title, start, end, moduleId)'
      });
    }
    
    const result = await SchedulerService.scheduleEvent(eventData);
    
    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in scheduling event:', error);
    return res.status(500).json({
      error: 'Server error during scheduling',
      details: error.message
    });
  }
};

/**
 * Schedule multiple events at once
 */
const batchSchedule = async (req, res) => {
  try {
    const { events } = req.body;
    
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        error: 'Events array is required and must not be empty'
      });
    }
    
    const results = await SchedulerService.batchSchedule(events);
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error in batch scheduling:', error);
    return res.status(500).json({
      error: 'Server error during batch scheduling',
      details: error.message
    });
  }
};

module.exports = {
  scheduleEvent,
  batchSchedule
};