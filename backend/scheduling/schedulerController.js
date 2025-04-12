const SchedulerService = require('../models/schedulerServiceModel');
const SchedulerOptimizer = require('../scheduling/schedulerOptimizer');
const Room = require('../models/roomModel');
const Module = require('../models/moduleModel');
const Staff = require('../models/staffModel');
const Event = require('../models/eventModel');
const { Constraint } = require('../models/constraintModel');

/**
 * Schedule a single event using backtracking algorithm
 */
const scheduleEvent = async (req, res) => {
  try {
    const eventData = req.body;
    
    // Validate required fields
    if (!eventData.title || !eventData.moduleId) {
      return res.status(400).json({
        error: 'Missing required fields (title, moduleId)'
      });
    }
    
    // Extract time preferences if provided
    const preferredStart = eventData.start ? new Date(eventData.start) : null;
    const preferredEnd = eventData.end ? new Date(eventData.end) : null;
    
    console.log("Starting backtracking for event:", eventData.title);
    
    // Set up the backtracking problem
    const result = await backtrackScheduleEvent(eventData);
    
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
 * Implementation of backtracking algorithm for scheduling a single event
 * This systematically tries different combinations of room, staff, and time slot
 */
const backtrackScheduleEvent = async (eventData) => {
  try {
    // Get all potential rooms with sufficient capacity
    const availableRooms = await Room.getAll(1000, 0, '', 'room.id', 'ASC', {
      minCapacity: eventData.student_count || 0
    });
    
    if (availableRooms.length === 0) {
      return {
        success: false,
        message: 'No rooms with sufficient capacity available'
      };
    }
    
    // Get module info to find appropriate staff
    const moduleInfo = await Module.getById(eventData.moduleId);
    const departmentId = moduleInfo?.departmentId;
    
    // Get potential staff members
    const availableStaff = await Staff.getAll(1000, 0, '', 'staff.id', 'ASC', {
      departmentId: departmentId || null
    });
    
    if (availableStaff.length === 0) {
      return {
        success: false,
        message: 'No staff members available for this module'
      };
    }
    
    // Generate time slots for the next 30 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    const durationMinutes = eventData.durationMinutes || 60;
    const daysToSchedule = eventData.daysToSchedule || [1, 2, 3, 4, 5]; // Weekdays by default
    
    const timeSlots = SchedulerOptimizer.generateTimeSlots(
      startDate, endDate, durationMinutes, daysToSchedule
    );
    
    if (timeSlots.length === 0) {
      return {
        success: false,
        message: 'No available time slots within the scheduling period'
      };
    }
    
    // Get existing events for constraint checking
    const existingEvents = await Event.getAll(1000, 0, '', 'event.start_time', 'ASC', {});
    
    // Set up the backtracking state
    const state = {
      rooms: availableRooms,
      staff: availableStaff,
      timeSlots,
      existingEvents: existingEvents.map(e => ({
        id: e.id,
        roomId: e.roomId,
        staffId: e.staffId,
        start: new Date(e.start_time || e.startTime),
        end: new Date(e.end_time || e.endTime),
        student_count: e.student_count || 0
      })),
      eventData,
      bestSolution: null,
      bestScore: -Infinity
    };
    
    // Start the backtracking search
    await backtrackSearch([], 0, state);
    
    // Check if we found a solution
    if (state.bestSolution) {
      const [room, staff, timeSlot] = state.bestSolution;
      
      // Create the event
      const newEvent = await Event.create({
        id: SchedulerOptimizer.generateEventId(),
        title: eventData.title,
        description: eventData.description || '',
        start_time: timeSlot.start,
        end_time: timeSlot.end,
        moduleId: eventData.moduleId,
        roomId: room.id,
        staffId: staff.id,
        courseId: eventData.courseId,
        student_count: eventData.student_count || 0,
        tag: eventData.tag || 'CLASS',
        students: eventData.students || []
      });
      
      return {
        success: true,
        event: newEvent,
        message: 'Event scheduled successfully using backtracking algorithm'
      };
    } else {
      return {
        success: false,
        message: 'Could not find a valid schedule after exhaustive search'
      };
    }
  } catch (error) {
    console.error('Error in backtracking scheduling:', error);
    return {
      success: false,
      message: `Error scheduling event: ${error.message}`
    };
  }
};

/**
 * Recursive backtracking search function
 * @param {Array} assignment - Current partial assignment [room, staff, timeSlot]
 * @param {Number} depth - Current depth in search tree (0=room, 1=staff, 2=timeSlot)
 * @param {Object} state - Search state with problem data and best solution
 */
const backtrackSearch = async (assignment, depth, state) => {
  // If we have a complete assignment, evaluate it
  if (depth === 3) {
    const [room, staff, timeSlot] = assignment;
    
    // Create a temporary event object for constraint checking
    const tempEvent = {
      id: null, // New event
      roomId: room.id,
      staffId: staff.id,
      moduleId: state.eventData.moduleId,
      student_count: state.eventData.student_count || 0,
      start: timeSlot.start,
      end: timeSlot.end
    };
    
    // Check constraints
    const validation = await Constraint.validateEvent(tempEvent);
    
    // If there are no hard violations, this is a valid solution
    if (validation.hardViolations.length === 0) {
      // Calculate a score based on soft warnings
      const score = calculateSolutionScore(assignment, validation.softWarnings);
      
      // If this solution is better than our current best, update it
      if (score > state.bestScore) {
        state.bestSolution = [...assignment];
        state.bestScore = score;
      }
    }
    
    return;
  }
  
  // Get the options to try at this level
  let options;
  if (depth === 0) {
    options = state.rooms;
  } else if (depth === 1) {
    options = state.staff;
  } else { // depth === 2
    options = state.timeSlots;
  }
  
  // Try each option
  for (const option of options) {
    const newAssignment = [...assignment, option];
    
    // Check if this partial assignment is promising
    if (await isPromising(newAssignment, depth, state)) {
      // Continue search with this option
      await backtrackSearch(newAssignment, depth + 1, state);
    }
  }
};

/**
 * Check if a partial assignment is promising (worth exploring further)
 * This helps prune the search space early
 */
const isPromising = async (assignment, depth, state) => {
  // At depth 0, we've just assigned a room
  if (depth === 0) {
    const room = assignment[0];
    // Only check capacity constraint
    return room.capacity >= state.eventData.student_count;
  }
  
  // At depth 1, we've assigned room and staff
  if (depth === 1) {
    // No specific constraints between room and staff to check
    return true;
  }
  
  // At depth 2, we've assigned room, staff, and time slot
  // Check for room and staff conflicts with existing events
  if (depth === 2) {
    const [room, staff, timeSlot] = assignment;
    
    // Check for room conflicts
    const roomConflict = state.existingEvents.some(event => 
      event.roomId === room.id && 
      ((event.start <= timeSlot.start && event.end > timeSlot.start) || 
       (event.start < timeSlot.end && event.end >= timeSlot.end) ||
       (event.start >= timeSlot.start && event.end <= timeSlot.end))
    );
    
    if (roomConflict) return false;
    
    // Check for staff conflicts
    const staffConflict = state.existingEvents.some(event => 
      event.staffId === staff.id && 
      ((event.start <= timeSlot.start && event.end > timeSlot.start) || 
       (event.start < timeSlot.end && event.end >= timeSlot.end) ||
       (event.start >= timeSlot.start && event.end <= timeSlot.end))
    );
    
    if (staffConflict) return false;
    
    return true;
  }
  
  return true;
};

/**
 * Calculate a score for a solution based on soft constraints
 */
const calculateSolutionScore = (assignment, softWarnings) => {
  const [room, staff, timeSlot] = assignment;
  let score = 100; // Start with a perfect score
  
  // Deduct points for soft warnings
  for (const warning of softWarnings) {
    if (warning.type !== 'POSITIVE') {
      switch (warning.constraintId) {
        case 'staff-preferred-hours':
          score -= 20;
          break;
        case 'lunch-hour':
          score -= 15;
          break;
        case 'back-to-back-classes':
          score -= 10;
          break;
        default:
          score -= 5;
      }
    } else {
      // Add points for positive constraints
      score += 10;
    }
  }
  
  // Prefer times closest to preferred times if specified
  if (assignment.eventData && assignment.eventData.start) {
    const preferredStart = new Date(assignment.eventData.start);
    const timeDiff = Math.abs(timeSlot.start - preferredStart) / (1000 * 60 * 60); // diff in hours
    score -= timeDiff * 5; // Penalize based on how far from preferred time
  }
  
  return score;
};

/**
 * Schedule multiple events at once using genetic algorithm
 */
const batchSchedule = async (req, res) => {
  try {
    const { events, preferences } = req.body;
    
    // Validate input
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        error: 'Events array is required and must not be empty'
      });
    }
    
    // Extract scheduling preferences
    const schedulingPreferences = {
      timeRange: preferences?.timeRange || 'any',
      daysOfWeek: preferences?.daysOfWeek || ['1', '2', '3', '4', '5'], // Mon-Fri by default
      maxEventsPerDay: preferences?.maxEventsPerDay || 3,
      gapBetweenEvents: preferences?.gapBetweenEvents || 15 // minutes
    };
    
    // Process events to ensure they have all required properties
    const eventsToSchedule = events.map(event => ({
      id: event.id || null,
      title: event.title,
      moduleId: event.moduleId,
      student_count: event.student_count || event.students?.length || 0,
      durationMinutes: event.durationMinutes || 60,
      preferredRoomIds: event.preferredRoomIds || [],
      preferredStaffIds: event.preferredStaffIds || [],
      students: event.students || []
    }));
    
    // Use the genetic algorithm optimizer for batch scheduling
    const optimizationResult = await SchedulerOptimizer.optimizeBatchScheduleGenetic(
      eventsToSchedule, 
      schedulingPreferences
    );
    
    // Return detailed results
    return res.status(200).json({
      success: optimizationResult.success,
      totalSuccess: optimizationResult.scheduledEvents.length,
      totalFailure: optimizationResult.unscheduledEvents.length,
      results: optimizationResult.scheduledEvents.map(event => ({
        success: true,
        event: event,
        eventData: eventsToSchedule.find(e => e.moduleId === event.moduleId)
      })).concat(
        optimizationResult.unscheduledEvents.map(event => ({
          success: false,
          eventData: event,
          message: 'Could not find a suitable time slot that satisfies all constraints'
        }))
      ),
      metrics: optimizationResult.metrics
    });
  } catch (error) {
    console.error('Error in batch scheduling optimization:', error);
    return res.status(500).json({
      error: 'Server error during batch scheduling optimization',
      details: error.message
    });
  }
};

module.exports = {
  scheduleEvent,
  backtrackScheduleEvent,
  batchSchedule
};