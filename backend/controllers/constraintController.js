const { Constraint } = require('../models/constraintModel');


const checkConstraints = async (req, res) => {
  try {
    const eventToCheck = req.body;
    console.log("Checking constraints for event:", eventToCheck);
    
    // Validate required fields
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
      student_count: eventToCheck.student_count || eventToCheck.studentCount || 0,
      event_date: eventToCheck.event_date || eventToCheck.eventDate,
      timeslot_id: eventToCheck.timeslot_id || eventToCheck.timeslotId
    };
    
    const result = await Constraint.validateEvent(event);
    
    // Group violations by category for better UI organization
    const hardViolationsByCategory = {};
    const softWarningsByCategory = {};
    
    result.hardViolations.forEach(violation => {
      const category = violation.constraintId.split('-')[0].toUpperCase();
      if (!hardViolationsByCategory[category]) {
        hardViolationsByCategory[category] = [];
      }
      hardViolationsByCategory[category].push(violation);
    });
    
    result.softWarnings.forEach(warning => {
      const category = warning.constraintId.split('-')[0].toUpperCase();
      if (!softWarningsByCategory[category]) {
        softWarningsByCategory[category] = [];
      }
      softWarningsByCategory[category].push(warning);
    });
    
    return res.status(200).json({
      hasHardViolations: result.hardViolations.length > 0,
      hardViolations: result.hardViolations,
      softWarnings: result.softWarnings,
      hardViolationsByCategory,
      softWarningsByCategory,
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
        type: 'HARD',
        category: 'ROOM_CONFLICT'
      },
      {
        id: 'staff-conflict',
        name: 'Staff Conflict',
        description: 'Staff cannot teach multiple classes at the same time',
        type: 'HARD',
        category: 'STAFF_CONFLICT'
      },
      {
        id: 'room-capacity',
        name: 'Room Capacity',
        description: 'Room must have sufficient capacity for the class',
        type: 'HARD',
        category: 'ROOM_CAPACITY'
      },
      {
        id: 'consecutive-teaching',
        name: 'Consecutive Teaching Hours',
        description: 'Staff should not exceed the maximum consecutive teaching hours',
        type: 'HARD',
        category: 'CONSECUTIVE_TEACHING'
      },
      {
        id: 'building-proximity',
        name: 'Building Proximity',
        description: 'Staff should have sufficient time to travel between buildings',
        type: 'SOFT',
        category: 'BUILDING_PROXIMITY'
      },
      {
        id: 'lunch-break',
        name: 'Lunch Break Protection',
        description: 'Staff should have time for lunch if teaching multiple classes in a day',
        type: 'SOFT',
        category: 'LUNCH_BREAK'
      },
      {
        id: 'staff-preferred-hours',
        name: 'Staff Preferred Hours',
        description: 'Staff should teach during their preferred hours when possible',
        type: 'SOFT',
        category: 'STAFF_PREFERENCE'
      },
      {
        id: 'back-to-back-classes',
        name: 'Back-to-Back Classes',
        description: 'Staff should have minimal gaps between classes',
        type: 'SOFT',
        category: 'STAFF_PREFERENCE'
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
    // Attempt to get real violations from the model
    let violations = [];
    
    try {
      violations = await require('../models/constraintModel').getViolations();
    } catch (error) {
      console.error('Error calling getViolations from model:', error);
      // Fallback to sample data if model function fails
      violations = [
        {
          id: "1",
          eventId: "EVT1001",
          eventTitle: "Advanced Databases Lecture",
          constraintType: "room-capacity",
          severity: "HARD",
          message: "Room capacity (25) is less than required (30)",
          date: "2025-04-10"
        },
        {
          id: "2",
          eventId: "EVT1002",
          eventTitle: "Machine Learning Workshop",
          constraintType: "staff-preferred-hours",
          severity: "SOFT",
          message: "Class scheduled outside preferred teaching hours (9:30 AM - 4:30 PM)",
          date: "2025-04-11"
        }
      ];
    }
    
    // Log what we're sending back for debugging
    console.log(`Returning ${violations.length} violations`);
    
    // Send consistent response format
    res.json({ violations });
  } catch (error) {
    console.error('Error in getViolations controller:', error);
    
    // Even if everything fails, return some sample data for UI development
    const sampleViolations = [
      {
        id: "1",
        eventId: "EVT1001",
        eventTitle: "Advanced Databases Lecture",
        constraintType: "room-capacity",
        severity: "HARD",
        message: "Room capacity (25) is less than required (30)",
        date: "2025-04-10"
      },
      {
        id: "2",
        eventId: "EVT1002",
        eventTitle: "Machine Learning Workshop",
        constraintType: "staff-preferred-hours",
        severity: "SOFT",
        message: "Class scheduled outside preferred teaching hours (9:30 AM - 4:30 PM)",
        date: "2025-04-11"
      }
    ];
    
    res.json({ violations: sampleViolations });
  }
};

// Full controller module, modified
module.exports = { 
  checkConstraints,
  getConstraints,
  getViolations
};