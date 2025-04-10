const Constraint = require('../models/constraintModel');

/**
 * Controller for handling constraint-related operations
 */
const checkConstraints = async (req, res) => {
  try {
    // Get the event to check
    const eventToCheck = req.body;
    console.log("Checking constraints for event:", eventToCheck);
    
    // Validate the event data
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
    
    if ((!eventToCheck.start && !eventToCheck.start_time) || 
        (!eventToCheck.end && !eventToCheck.end_time)) {
      return res.status(400).json({
        error: 'Start and end times are required'
      });
    }
    
    // Map to the expected format
    const event = {
      id: eventToCheck.id || null,
      roomId: eventToCheck.roomId || eventToCheck.room_id,
      staffId: eventToCheck.staffId || eventToCheck.staff_id,
      moduleId: eventToCheck.moduleId || eventToCheck.module_id,
      student_count: eventToCheck.student_count || eventToCheck.student_count || 0,
      start: eventToCheck.start || eventToCheck.start_time,
      end: eventToCheck.end || eventToCheck.end_time
    };
    
    // Run all constraint checks
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

// Get all available constraints
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
    // Since we don't have a table for violations yet, return mock data
    const mockViolations = [
      {
        id: "v1",
        eventId: "EVT1001",
        eventTitle: "Introduction to Computer Science",
        constraintType: "room-conflict",
        severity: "HARD",
        message: "Room R101 is already booked during this time",
        date: "2025-04-15"
      },
      {
        id: "v2",
        eventId: "EVT1002",
        eventTitle: "Advanced Database Systems",
        constraintType: "staff-conflict",
        severity: "HARD",
        message: "Staff member is already teaching during this time",
        date: "2025-04-16"
      },
      {
        id: "v3",
        eventId: "EVT1003",
        eventTitle: "Web Development Workshop",
        constraintType: "room-capacity",
        severity: "HARD",
        message: "Room capacity (30) is insufficient for class size (35)",
        date: "2025-04-18"
      },
      {
        id: "v4",
        eventId: "EVT1004",
        eventTitle: "Project Management",
        constraintType: "staff-preferred-hours",
        severity: "SOFT",
        message: "Outside of staff preferred hours (8:00-16:00)",
        date: "2025-04-17"
      }
    ];
    
    return res.status(200).json({ violations: mockViolations });
  } catch (error) {
    console.error('Error getting constraint violations:', error);
    return res.status(500).json({ error: 'Failed to fetch constraint violations' });
  }
};

module.exports = { 
  checkConstraints,
  getConstraints,
  getViolations
};