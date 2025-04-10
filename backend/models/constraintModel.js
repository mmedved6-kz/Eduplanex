const db = require('../config/db');

/**
 * Model for handling constraint checking and enforcement
 */
const Constraint = {
  /**
   * Checks if a room is already booked for the given time period
   */
  checkRoomAvailability: async (roomId, startTime, endTime, eventId = null) => {
    // SQL to find conflicting events for the same room
    const params = [roomId, startTime, endTime];
    let query = `
      SELECT * FROM Event 
      WHERE roomId = $1 
      AND (
        (startTime <= $2 AND endTime > $2) OR  -- Event starts during another event
        (startTime < $3 AND endTime >= $3) OR  -- Event ends during another event
        (startTime >= $2 AND endTime <= $3)    -- Event is completely within the time period
      )
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
  checkStaffAvailability: async (staffId, startTime, endTime, eventId = null) => {
    const params = [staffId, startTime, endTime];
    let query = `
      SELECT * FROM Event 
      WHERE staffId = $1 
      AND (
        (startTime <= $2 AND endTime > $2) OR
        (startTime < $3 AND endTime >= $3) OR
        (startTime >= $2 AND endTime <= $3)
      )
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

  checkStaffPreferredHours: async (startTime, endTime) => {
    const eventStart = new Date(startTime);
    const eventEnd = new Date(endTime);
    const startHour = eventStart.getHours() + (eventStart.getMinutes() / 60);
    const endHour = eventEnd.getHours() + (eventEnd.getMinutes() / 60);
    
    // Define "ideal" teaching hours (9:30 AM - 4:30 PM)
    const idealStartHour = 9.5;  // 9:30 AM
    const idealEndHour = 16.5;   // 4:30 PM
    
    // Define lunch hours to avoid (12 PM - 1 PM)
    const lunchStartHour = 12;
    const lunchEndHour = 13;
    
    const isWithinIdealHours = startHour >= idealStartHour && endHour <= idealEndHour;
    const overlapsLunch = startHour < lunchEndHour && endHour > lunchStartHour;
    
    let message = null;
    if (!isWithinIdealHours) {
      message = 'Class scheduled outside preferred teaching hours (9:30 AM - 4:30 PM)';
    } else if (overlapsLunch) {
      message = 'Class overlaps with typical lunch hours (12 PM - 1 PM)';
    }
    
    return {
      isPreferred: isWithinIdealHours && !overlapsLunch,
      message: message
    };
  },

  checkBackToBackClasses: async (staffId, startTime, endTime, eventId = null) => {
    const eventDate = new Date(startTime);
    const dayStart = new Date(eventDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(eventDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    // Get all events for this staff on the same day
    const params = [staffId, dayStart, dayEnd];
    let query = `
      SELECT * FROM Event 
      WHERE staffId = $1 
      AND startTime >= $2 
      AND endTime <= $3
    `;
    
    if (eventId) {
      query += ' AND id != $4';
      params.push(eventId);
    }
    
    const events = await db.any(query, params);
    
    // Check for optimal gaps (15-30 minutes between classes)
    let hasOptimalGap = false;
    let hasLongGap = false;
    let message = null;
    
    for (const existingEvent of events) {
      const existingStart = new Date(existingEvent.starttime);
      const existingEnd = new Date(existingEvent.endtime);
      
      // Calculate time between classes (in minutes)
      const gapAfterExisting = (new Date(startTime) - existingEnd) / (1000 * 60);
      const gapBeforeExisting = (existingStart - new Date(endTime)) / (1000 * 60);
      
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
    const { id, roomId, staffId, student_count, start, end } = event;
    
    // Convert start and end to proper format if needed
    const startTime = new Date(start);
    const endTime = new Date(end);
    
    // Check for hard violations
    const hardViolations = [];
    
    // Check room availability
    const roomCheck = await Constraint.checkRoomAvailability(
      roomId, 
      startTime, 
      endTime, 
      id
    );
    
    if (!roomCheck.available) {
      hardViolations.push({
        constraintId: 'room-conflict',
        type: 'HARD',
        message: 'Room is already booked during this time'
      });
    }
    
    // Check staff availability
    const staffCheck = await Constraint.checkStaffAvailability(
      staffId, 
      startTime, 
      endTime, 
      id
    );
    
    if (!staffCheck.available) {
      hardViolations.push({
        constraintId: 'staff-conflict',
        type: 'HARD',
        message: 'Staff member is already teaching during this time'
      });
    }
    
    // Check room capacity
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
    
    // Check staff preferred hours
    const preferredHoursCheck = await Constraint.checkStaffPreferredHours(startTime, endTime);
    if (!preferredHoursCheck.isPreferred) {
      softWarnings.push({
        constraintId: 'staff-preferred-hours',
        type: 'SOFT',
        message: preferredHoursCheck.message
      });
    }
    
    // Check for back-to-back classes
    const backToBackCheck = await Constraint.checkBackToBackClasses(staffId, startTime, endTime, id);
    if (backToBackCheck.hasLongGap) {
      softWarnings.push({
        constraintId: 'back-to-back-classes',
        type: 'SOFT',
        message: backToBackCheck.message
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
    // Query for hard violations
    const hardViolations = await db.any(`
      SELECT 
        v.id, 
        v.event_id AS "eventId", 
        e.title AS "eventTitle", 
        v.constraint_type AS "constraintType", 
        'HARD' AS severity,
        v.message, 
        TO_CHAR(v.created_at, 'YYYY-MM-DD') AS date
      FROM event_violations v
      JOIN Event e ON v.event_id = e.id
      ORDER BY v.created_at DESC
      LIMIT 10
    `);
    
    // Query for soft warnings
    const softWarnings = await db.any(`
      SELECT 
        w.id, 
        w.event_id AS "eventId", 
        e.title AS "eventTitle", 
        w.constraint_type AS "constraintType", 
        'SOFT' AS severity,
        w.message, 
        TO_CHAR(w.created_at, 'YYYY-MM-DD') AS date
      FROM event_warnings w
      JOIN Event e ON w.event_id = e.id
      ORDER BY w.created_at DESC
      LIMIT 10
    `);
    
    return [...hardViolations, ...softWarnings];
  } catch (error) {
    console.error('Error fetching violations from database:', error);
    return [];
  }
};

module.exports = {
  Constraint,
  getViolations,
}