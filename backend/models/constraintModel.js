const db = require('../config/db');

// Helper to convert time strings to minutes
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function areTimeslotsAdjacent(timeslot1, timeslot2) {
  const t1Start = new Date(`2000-01-01T${timeslot1.start_time}`);
  const t1End = new Date(`2000-01-01T${timeslot1.end_time}`);
  const t2Start = new Date(`2000-01-01T${timeslot2.start_time}`);
  const t2End = new Date(`2000-01-01T${timeslot2.end_time}`);
  
  // Check if they overlap or are immediately adjacent (end time = start time)
  return (t1Start <= t2End && t1End >= t2Start) || 
         (t1End.getTime() === t2Start.getTime()) || 
         (t2End.getTime() === t1Start.getTime());
}

/**
 * Model for handling constraint checking and enforcement
 */
const Constraint = {
  /**
   * Checks if a room is already booked for the given time period
   */
  checkRoomAvailability: async (roomId, date, timeslotId, eventId = null) => {
    // SQL to find conflicting events for the same room on the same date and timeslot
    const params = [roomId, date, timeslotId];
    let query = `
      SELECT * FROM Event 
      WHERE roomId = $1 
      AND event_date = $2
      AND timeslot_id = $3
    `;
    
    // If we're updating an existing event, exclude it from the check
    if (eventId) {
      query += ' AND id != $4';
      params.push(eventId);
    }
    
    const conflictingEvents = await db.any(query, params);
    return {
      available: conflictingEvents.length === 0,
      conflicts: conflictingEvents
    };
  },
  
  /**
   * Checks if a staff member is already scheduled during the given time period
   */
  checkStaffAvailability: async (staffId, date, timeslotId, eventId = null) => {
    const params = [staffId, date, timeslotId];
    let query = `
      SELECT * FROM Event 
      WHERE staffId = $1 
      AND event_date = $2
      AND timeslot_id = $3
    `;
    
    if (eventId) {
      query += ' AND id != $4';
      params.push(eventId);
    }
    
    const conflictingEvents = await db.any(query, params);
    return {
      available: conflictingEvents.length === 0,
      conflicts: conflictingEvents
    };
  },
  
  /**
   * Checks if a room has sufficient capacity for the event
   */
  checkRoomCapacity: async (roomId, student_count) => {
    const room = await db.oneOrNone('SELECT capacity FROM Room WHERE id = $1', [roomId]);
    
    if (!room) {
      return {
        capacityOk: false,
        message: 'Room does not exist'
      };
    }
    
    return {
      capacityOk: room.capacity >= student_count,
      roomCapacity: room.capacity,
      student_count,
      message: room.capacity < student_count ? 
        `Room capacity (${room.capacity}) is less than required (${student_count})` : 
        null
    };
  },

  checkStaffPreferredHours: async (start_time) => {
    // Parse the time (assuming format like '09:30:00')
    const [hours, minutes] = start_time.split(':').map(Number);
    const startHour = hours + (minutes / 60);
    
    // Define "ideal" teaching hours (9:30 AM - 4:30 PM)
    const idealStartHour = 9.5;  // 9:30 AM
    const idealEndHour = 16.5;   // 4:30 PM
    
    // Define lunch hours to avoid (12 PM - 1 PM)
    const lunchStartHour = 12;
    const lunchEndHour = 13;
    
    const isWithinIdealHours = startHour >= idealStartHour && startHour < idealEndHour;
    const isLunchHour = startHour >= lunchStartHour && startHour < lunchEndHour;
    
    let message = null;
    if (!isWithinIdealHours) {
      message = 'Class scheduled outside preferred teaching hours (9:30 AM - 4:30 PM)';
    } else if (isLunchHour) {
      message = 'Class scheduled during typical lunch hours (12 PM - 1 PM)';
    }
    
    return {
      isPreferred: isWithinIdealHours && !isLunchHour,
      message: message
    };
  },

  checkBackToBackClasses: async (staffId, event_date, timeslot_id, eventId = null) => {
    // Get all events for this staff on the selected date
    const params = [staffId, event_date];
    let query = `
      SELECT event.*, timeslot.start_time, timeslot.end_time 
      FROM Event event
      JOIN timeslot timeslot ON event.timeslot_id = timeslot.id
      WHERE event.staffId = $1 
      AND event.event_date = $2
    `;
    
    if (eventId) {
      query += ' AND event.id != $3';
      params.push(eventId);
    }
    
    const events = await db.any(query, params);
    
    // Get the timeslot for the current event
    const currentTimeslot = await db.oneOrNone('SELECT * FROM timeslot WHERE id = $1', [timeslot_id]);
    
    // Check for optimal gaps (15-30 minutes between classes)
    let hasOptimalGap = false;
    let hasLongGap = false;
    let message = null;
    
    for (const existingEvent of events) {
      // Calculate time gaps between events (in minutes)
      // Convert time strings to minutes for comparison
      const currentStartMinutes = timeToMinutes(currentTimeslot.start_time);
      const currentEndMinutes = timeToMinutes(currentTimeslot.end_time);
      const existingStartMinutes = timeToMinutes(existingEvent.start_time);
      const existingEndMinutes = timeToMinutes(existingEvent.end_time);
      
      // Calculate gap after existing event
      const gapAfterExisting = currentStartMinutes - existingEndMinutes;
      
      // Calculate gap before existing event
      const gapBeforeExisting = existingStartMinutes - currentEndMinutes;
      
      // Check for good gaps (15-30 minutes)
      if ((gapAfterExisting > 0 && gapAfterExisting <= 30) || 
          (gapBeforeExisting > 0 && gapBeforeExisting <= 30)) {
        hasOptimalGap = true;
      }
      
      // Check for inefficient gaps (30 minutes to 2 hours)
      if ((gapAfterExisting > 30 && gapAfterExisting < 120) || 
          (gapBeforeExisting > 30 && gapBeforeExisting < 120)) {
        hasLongGap = true;
        message = 'Schedule creates inefficient gaps for staff (30min-2hr)';
      }
    }
    
    if (hasOptimalGap && !message) {
      message = 'Schedule creates efficient back-to-back classes with short breaks';
    }
    
    return {
      hasOptimalGap,
      hasLongGap,
      message
    };
  },
  
  /**
   * Performs all constraint checks for an event
   */
  validateEvent: async (event) => {
    const { id, roomId, staffId, student_count, event_date, timeslot_id } = event;
    
    const timeslot = await db.oneOrNone('SELECT * FROM timeslot WHERE id = $1', [timeslot_id]);
    if (!timeslot) {
      return {
        hardViolations: [{
          constraintId: 'invalid-timeslot',
          type: 'HARD',
          message: 'The specified timeslot does not exist'
        }],
        softWarnings: []
      };
    }
    
    // Check for hard violations
    const hardViolations = [];
    
    // Room availability check
    const roomCheck = await Constraint.checkRoomAvailability(
      roomId, 
      event_date, 
      timeslot_id, 
      id
    );
    
    if (!roomCheck.available) {
      hardViolations.push({
        constraintId: 'room-conflict',
        type: 'HARD',
        message: 'Room is already booked during this time'
      });
    }
    
    // Staff availability check
    const staffCheck = await Constraint.checkStaffAvailability(
      staffId, 
      event_date, 
      timeslot_id, 
      id
    );
    
    if (!staffCheck.available) {
      hardViolations.push({
        constraintId: 'staff-conflict',
        type: 'HARD',
        message: 'Staff member is already teaching during this time'
      });
    }
    
    // Room capacity check
    const capacityCheck = await Constraint.checkRoomCapacity(roomId, student_count);
    
    if (!capacityCheck.capacityOk) {
      hardViolations.push({
        constraintId: 'room-capacity',
        type: 'HARD',
        message: capacityCheck.message
      });
    }
    
    // Check for soft warnings
    const softWarnings = [];
    
    // Staff preferred hours check
    const preferredHoursCheck = await Constraint.checkStaffPreferredHours(timeslot.start_time);
    if (!preferredHoursCheck.isPreferred) {
      softWarnings.push({
        constraintId: 'staff-preferred-hours',
        type: 'SOFT',
        message: preferredHoursCheck.message
      });
    }
    
    // Back-to-back classes check
    const backToBackCheck = await Constraint.checkBackToBackClasses(staffId, event_date, timeslot_id, id);
    if (backToBackCheck.hasLongGap) {
      softWarnings.push({
        constraintId: 'back-to-back-classes',
        type: 'SOFT',
        message: backToBackCheck.message
      });
    }
    
    // NEW: Consecutive teaching check
    const consecutiveCheck = await Constraint.checkConsecutiveTeaching(staffId, event_date, timeslot_id, id);
    if (consecutiveCheck.hasViolation) {
      hardViolations.push({
        constraintId: 'consecutive-teaching',
        type: 'HARD',
        message: consecutiveCheck.message
      });
    }
    
    // NEW: Building proximity check
    const proximityCheck = await Constraint.checkBuildingProximity(staffId, event_date, timeslot_id, roomId, id);
    if (proximityCheck.hasWarning) {
      softWarnings.push({
        constraintId: 'building-proximity',
        type: 'SOFT',
        message: proximityCheck.message
      });
    }
    
    // NEW: Lunch break check
    const lunchCheck = await Constraint.checkLunchBreak(staffId, event_date, timeslot_id, id);
    if (lunchCheck.hasWarning) {
      softWarnings.push({
        constraintId: 'lunch-break',
        type: 'SOFT',
        message: lunchCheck.message
      });
    }
    
    return {
      hardViolations,
      softWarnings
    };
  }
};

const getViolations = async () => {
  try {
    // Query for hard violations - try to use the table if it exists
    let hardViolations = [];
    try {
      hardViolations = await db.any(`
        SELECT 
          v.id, 
          v.event_id AS "eventId", 
          event.title AS "eventTitle", 
          v.constraint_type AS "constraintType", 
          'HARD' AS severity,
          v.message, 
          TO_CHAR(v.created_at, 'YYYY-MM-DD') AS date
        FROM event_violations v
        JOIN Event event ON v.event_id = event.id
        ORDER BY v.created_at DESC
        LIMIT 10
      `);
    } catch (error) {
      console.warn('Error fetching hard violations, table might not exist yet:', error);
      // Provide sample data for development
      hardViolations = [
        {
          id: "1",
          eventId: "EVT1001",
          eventTitle: "Advanced Databases Lecture",
          constraintType: "room-capacity",
          severity: "HARD",
          message: "Room capacity (25) is less than required (30)",
          date: "2025-04-10"
        }
      ];
    }
    
    // Query for soft warnings - try to use the table if it exists
    let softWarnings = [];
    try {
      softWarnings = await db.any(`
        SELECT 
          w.id, 
          w.event_id AS "eventId", 
          event.title AS "eventTitle", 
          w.constraint_type AS "constraintType", 
          'SOFT' AS severity,
          w.message, 
          TO_CHAR(w.created_at, 'YYYY-MM-DD') AS date
        FROM event_warnings w
        JOIN Event event ON w.event_id = event.id
        ORDER BY w.created_at DESC
        LIMIT 10
      `);
    } catch (error) {
      console.warn('Error fetching soft warnings, table might not exist yet:', error);
      // Provide sample data for development
      softWarnings = [
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
    
    return [...hardViolations, ...softWarnings];
  } catch (error) {
    console.error('Error fetching violations from database:', error);
    
    // Return sample data if all else fails
    return [
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
};

checkConsecutiveTeaching: async (staffId, date, timeslotId, eventId = null) => {
  // Get all events for this staff on the selected date
  const params = [staffId, date];
  let query = `
    SELECT event.*, timeslot.start_time, timeslot.end_time 
    FROM Event event
    JOIN timeslot timeslot ON event.timeslot_id = timeslot.id
    WHERE event.staffId = $1 
    AND event.event_date = $2
  `;
  
  if (eventId) {
    query += ' AND event.id != $3';
    params.push(eventId);
  }
  
  const events = await db.any(query, params);
  
  // Get the timeslot for the current event
  const currentTimeslot = await db.oneOrNone('SELECT * FROM timeslot WHERE id = $1', [timeslotId]);
  
  // Maximum consecutive teaching hours
  const MAX_CONSECUTIVE_HOURS = 3;
  
  // Check for consecutive teaching violations
  let consecutiveHours = currentTimeslot.duration_minutes / 60;
  let hasViolation = false;
  let message = null;
  
  for (const existingEvent of events) {
    // If events are adjacent or overlapping, add their duration
    if (areTimeslotsAdjacent(currentTimeslot, existingEvent)) {
      consecutiveHours += existingEvent.duration_minutes / 60;
    }
  }
  
  if (consecutiveHours > MAX_CONSECUTIVE_HOURS) {
    hasViolation = true;
    message = `Staff would exceed maximum consecutive teaching hours (${MAX_CONSECUTIVE_HOURS})`;
  }
  
  return {
    hasViolation,
    message
  };
}

checkBuildingProximity: async (staffId, date, timeslotId, roomId, eventId = null) => {
  // Get previous event for this staff on the same day
  const params = [staffId, date, timeslotId];
  let query = `
    SELECT event.*, room.buildingId as roomBuildingId
    FROM Event event
    JOIN timeslot ON event.timeslot_id = timeslot.id
    JOIN room ON event.roomId = room.id
    WHERE event.staffId = $1 
    AND event.event_date = $2
    AND timeslot.end_time < (SELECT start_time FROM timeslot WHERE id = $3)
    ORDER BY timeslot.end_time DESC
    LIMIT 1
  `;
  
  if (eventId) {
    query += ' AND event.id != $4';
    params.push(eventId);
  }
  
  const previousEvent = await db.oneOrNone(query, params);
  
  if (!previousEvent) {
    return { hasWarning: false }; // No previous event, no proximity issue
  }
  
  // Get the room for the current event
  const currentRoom = await db.oneOrNone('SELECT * FROM room WHERE id = $1', [roomId]);
  
  // Get the timeslot for the current event
  const currentTimeslot = await db.oneOrNone('SELECT * FROM timeslot WHERE id = $1', [timeslotId]);
  
  // Get the timeslot for the previous event
  const previousTimeslot = await db.oneOrNone('SELECT * FROM timeslot WHERE id = $1', [previousEvent.timeslot_id]);
  
  // If buildings are different, check if there's enough time to travel
  if (previousEvent.roomBuildingId !== currentRoom.buildingId) {
    // Calculate time gap in minutes
    const previousEndTime = new Date(`2000-01-01T${previousTimeslot.end_time}`);
    const currentStartTime = new Date(`2000-01-01T${currentTimeslot.start_time}`);
    const timeGapMinutes = (currentStartTime - previousEndTime) / (1000 * 60);
    
    const MINIMUM_TRAVEL_TIME = 15; // minutes
    
    if (timeGapMinutes < MINIMUM_TRAVEL_TIME) {
      return {
        hasWarning: true,
        message: `Insufficient travel time (${timeGapMinutes} min) between buildings. At least ${MINIMUM_TRAVEL_TIME} min recommended.`
      };
    }
  }
  
  return { hasWarning: false };
}

checkLunchBreak: async (staffId, date, timeslotId, eventId = null) => {
  // Get the timeslot for the current event
  const currentTimeslot = await db.oneOrNone('SELECT * FROM timeslot WHERE id = $1', [timeslotId]);
  
  // Define lunch period (usually 12:00 to 13:00)
  const lunchStartTime = new Date(`2000-01-01T12:00:00`);
  const lunchEndTime = new Date(`2000-01-01T13:00:00`);
  
  // Convert current event times to Date objects for comparison
  const eventStartTime = new Date(`2000-01-01T${currentTimeslot.start_time}`);
  const eventEndTime = new Date(`2000-01-01T${currentTimeslot.end_time}`);
  
  // Check if event overlaps lunch period
  const overlapsLunch = (
    (eventStartTime <= lunchEndTime && eventEndTime >= lunchStartTime)
  );
  
  if (overlapsLunch) {
    // Check if staff has any other events during the day 
    // to determine if this is their only opportunity for lunch
    const otherEvents = await db.any(`
      SELECT COUNT(*) as count
      FROM Event
      WHERE staffId = $1 
      AND event_date = $2
      AND id != $3
    `, [staffId, date, eventId || '']);
    
    // If staff has multiple events, lunch period should be protected
    if (otherEvents.count > 0) {
      return {
        hasWarning: true,
        message: 'Event scheduled during lunch hour (12:00-13:00)'
      };
    }
  }
  
  return { hasWarning: false };
}

module.exports = {
  Constraint,
  getViolations
}