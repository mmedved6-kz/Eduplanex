const { Constraint } = require('../models/constraintModel');


const checkConstraints = async (req, res) => {
  try {
    const eventToCheck = req.body;
    console.log("Checking constraints for event:", eventToCheck);
    
    if (!eventToCheck.room_id && !eventToCheck.roomId) {
      return res.status(400).json({
        error: 'Room ID is required'
      });
    }
    
    if (!eventToCheck.staff_id && !eventToCheck.staffId) {
      return res.status(400).json({
        error: 'Staff ID is required'
      });
    }
    
    if ((!eventToCheck.event_date && !eventToCheck.eventDate) || 
        (!eventToCheck.timeslot_id && !eventToCheck.timeslotId)) {
      return res.status(400).json({
        error: 'Event date and timeslot ID are required'
      });
    }
    
    
    const event = {
      id: eventToCheck.id || null,
      roomId: eventToCheck.roomId || eventToCheck.room_id,
      staffId: eventToCheck.staffId || eventToCheck.staff_id,
      moduleId: eventToCheck.moduleId || eventToCheck.module_id,
      student_count: eventToCheck.student_count || eventToCheck.student_count || 0,
      event_date: eventToCheck.event_date || eventToCheck.eventDate,
      timeslot_id: eventToCheck.timeslot_id || eventToCheck.timeslotId
    };
    
    const result = await Constraint.validateEvent(event);
    
    return res.status(200).json({
      hasHardViolations: result.hardViolations.length > 0,
      hardViolations: result.hardViolations,
      softWarnings: result.softWarnings,
      canSchedule: result.hardViolations.length === 0
    });
  } catch (error) {
    console.error('Error checking constraints:', error);
    return res.status(500).json({
      error: 'Server error during constraint checking',
      details: error.message
    });
  }
};

const getConstraints = async (req, res) => {
  try {
    const constraints = [
      {
        id: 'room-conflict',
        name: 'Room Conflict',
        description: 'A room cannot be used by multiple classes at the same time',
        type: 'HARD'
      },
      {
        id: 'staff-conflict',
        name: 'Staff Conflict',
        description: 'Staff cannot teach multiple classes at the same time',
        type: 'HARD'
      },
      {
        id: 'room-capacity',
        name: 'Room Capacity',
        description: 'Room must have sufficient capacity for the class',
        type: 'HARD'
      },
      {
        id: 'staff-preferred-hours',
        name: 'Staff Preferred Hours',
        description: 'Staff should teach during their preferred hours when possible',
        type: 'SOFT'
      },
      {
        id: 'back-to-back-classes',
        name: 'Back-to-Back Classes',
        description: 'Staff should have minimal gaps between classes',
        type: 'SOFT'
      }
    ];
    
    return res.status(200).json(constraints);
  } catch (error) {
    console.error('Error getting constraints:', error);
    return res.status(500).json({
      error: 'Server error retrieving constraints',
      details: error.message
    });
  }
};

const getViolations = async (req, res) => {
  try {
    const violations = await Constraint.getViolations();
    res.json({ violations });
  } catch (error) {
    console.error('Error in getViolations controller:', error);
    res.status(500).json({ error: 'Failed to fetch violations' });
  }
};

module.exports = { 
  checkConstraints,
  getConstraints,
  getViolations
};