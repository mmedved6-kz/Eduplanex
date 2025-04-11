const Constraint = require('../models/constraintModel');
const Event = require('../models/eventModel');
const Room = require('../models/roomModel');
const Module = require('../models/moduleModel');
const Staff = require('../models/staffModel');
const db = require('../config/db');

/**
 * Scheduling optimizer to handle multiple constraints in the scheduling process. e.g. Autoscheduler 
*/
class SchedulerOptimizer {
    /**
     * To generate timeslots for a given date range and duration
     * @param {Date} start_time 
     * @param {Date} end_time 
     * @param {Number} durationMinutes 
     * @param {Array} daysToInclude 
     * @returns {Array} Array of time slots
     */
  static generateTimeSlots(startDate, endDate, durationMinutes = 60, daysToSchedule = [1, 2, 3, 4, 5]) {
    const slots = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // For each day in the range
    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      // Skip days that aren't in our scheduling days
      if (!daysToSchedule.includes(day.getDay())) continue;
      
      // For each hour from 8 AM to 5 PM (configurable)
      for (let hour = 8; hour < 17; hour++) {
        // For each slot within the hour (e.g., 9:00, 9:30 for 30-min slots)
        for (let minute = 0; minute < 60; minute += 30) {  // Allow 30-min increments
          const slotStart = new Date(day);
          slotStart.setHours(hour, minute, 0, 0);
          
          const slotEnd = new Date(day);
          slotEnd.setMinutes(slotStart.getMinutes() + durationMinutes);
          
          // Only add slots that end before 6 PM
          if (slotEnd.getHours() < 18) {
            slots.push({
              start: slotStart,
              end: slotEnd
            });
          }
        }
      }
    }
    
    return slots;
  }

    /**
     * Fetch all constraints and fetch events needed for scehduling
     * @returns object containing rooms, staff and existing events
     */
  static async fetchSchedulingData() {
    try {
      // Get all rooms
      const rooms = await Room.getAll(1000, 0, '', 'room.id', 'ASC', {});
      
      // Get all staff
      const staff = await Staff.getAll(1000, 0, '', 'staff.id', 'ASC', {});
      
      // Get existing events (for next 60 days)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 60);
      
      const events = await Event.getAll(1000, 0, '', 'event.start_time', 'ASC', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      return {
        rooms,
        staff,
        existingEvents: events.map(event => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          roomId: event.roomId,
          staffId: event.staffId,
          student_count: event.student_count || 0
        }))
      };
    } catch (error) {
      console.error('Error fetching scheduling data:', error);
      throw error;
    }
  }

  /**
   * Check if a combination of event, room, staff, and time is valid
   * @param {Object} event - The event to be scheduled
   * @param {Object} room - Potential room
   * @param {Object} staffMember - Potential staff
   * @param {Object} timeSlot - Potential time slot
   * @param {Array} existingEvents - Already scheduled events
   * @returns {Promise<Object>} Validation result with success and constraint violations
   */
  static async validateCombination(event, room, staffMember, timeSlot, existingEvents) {
    // First check basic availability conflicts
    // 1. Room conflicts
    const roomConflict = existingEvents.some(e => 
      e.roomId === room.id && 
      ((e.start <= timeSlot.start && e.end > timeSlot.start) || 
       (e.start < timeSlot.end && e.end >= timeSlot.end) ||
       (e.start >= timeSlot.start && e.end <= timeSlot.end))
    );
    
    if (roomConflict) {
      return {
        valid: false,
        hardViolations: [{
          constraintId: 'room-conflict',
          message: `Room ${room.name} is already booked during this time`
        }],
        softWarnings: []
      };
    }
    
    // 2. Staff conflicts
    const staffConflict = existingEvents.some(e => 
      e.staffId === staffMember.id && 
      ((e.start <= timeSlot.start && e.end > timeSlot.start) || 
       (e.start < timeSlot.end && e.end >= timeSlot.end) ||
       (e.start >= timeSlot.start && e.end <= timeSlot.end))
    );
    
    if (staffConflict) {
      return {
        valid: false,
        hardViolations: [{
          constraintId: 'staff-conflict',
          message: `Staff member ${staffMember.name} is already teaching during this time`
        }],
        softWarnings: []
      };
    }
    
    // 3. Room capacity
    if (event.student_count > room.capacity) {
      return {
        valid: false,
        hardViolations: [{
          constraintId: 'room-capacity',
          message: `Room ${room.name} capacity (${room.capacity}) is insufficient for class size (${event.student_count})`
        }],
        softWarnings: []
      };
    }
    
    // Now check soft constraints
    const softWarnings = [];
    
    // 1. Staff preferred hours
    const startHour = timeSlot.start.getHours() + (timeSlot.start.getMinutes() / 60);
    if (startHour < 9.5 || startHour > 16.5) {
      softWarnings.push({
        constraintId: 'staff-preferred-hours',
        message: `Class scheduled outside preferred teaching hours (9:30 AM - 4:30 PM)`
      });
    }
    
    // 2. Lunch hour (12-1 PM)
    const endHour = timeSlot.end.getHours() + (timeSlot.end.getMinutes() / 60);
    if ((startHour < 13 && endHour > 12) || (startHour === 12)) {
      softWarnings.push({
        constraintId: 'lunch-hour',
        message: `Class overlaps with typical lunch hour (12 PM - 1 PM)`
      });
    }
    
    // 3. Check for back-to-back classes (if staff has other classes that day)
    const sameDayEvents = existingEvents.filter(e => 
      e.staffId === staffMember.id &&
      e.start.toDateString() === timeSlot.start.toDateString()
    );
    
    // Look for events with good gaps (15-30 min) or inefficient gaps (30 min - 2 hours)
    let hasOptimalGap = false;
    let hasLongGap = false;
    
    for (const existingEvent of sameDayEvents) {
      // Calculate gap after this existing event
      const gapAfterExisting = (timeSlot.start.getTime() - existingEvent.end.getTime()) / (1000 * 60);
      
      // Calculate gap before this existing event
      const gapBeforeExisting = (existingEvent.start.getTime() - timeSlot.end.getTime()) / (1000 * 60);
      
      // Check for optimal gaps (15-30 minutes)
      if ((gapAfterExisting > 0 && gapAfterExisting <= 30) || 
          (gapBeforeExisting > 0 && gapBeforeExisting <= 30)) {
        hasOptimalGap = true;
      }
      
      // Check for inefficient gaps (30 min - 2 hours)
      if ((gapAfterExisting > 30 && gapAfterExisting < 120) || 
          (gapBeforeExisting > 30 && gapBeforeExisting < 120)) {
        hasLongGap = true;
        softWarnings.push({
          constraintId: 'back-to-back-classes',
          message: `Schedule creates inefficient gaps for staff (30min-2hr)`
        });
      }
    }
    
    // Add a positive note for efficient back-to-back scheduling
    if (hasOptimalGap) {
      softWarnings.push({
        constraintId: 'optimal-gaps',
        type: 'POSITIVE',
        message: `Schedule creates efficient back-to-back classes with short breaks`
      });
    }
    
    return {
      valid: true,
      hardViolations: [],
      softWarnings
    };
  }

  /**
   * Find valid time slots for an event with specific room and staff
   * @param {Object} event - The event to be scheduled
   * @param {Object} room - The room to use
   * @param {Object} staffMember - The staff member to assign
   * @param {Array} timeSlots - Available time slots
   * @param {Array} existingEvents - Already scheduled events
   * @returns {Promise<Array>} Array of valid time slots with their constraint evaluations
   */
  static async findValidTimeSlots(event, room, staffMember, timeSlots, existingEvents) {
    const validSlots = [];
    
    for (const slot of timeSlots) {
      const validation = await this.validateCombination(
        event, room, staffMember, slot, existingEvents
      );
      
      if (validation.valid) {
        validSlots.push({
          timeSlot: slot,
          softWarnings: validation.softWarnings,
          // Calculate a score based on soft constraints
          score: this.calculateSlotScore(slot, validation.softWarnings)
        });
      }
    }
    
    // Sort by score (descending)
    return validSlots.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate a score for a time slot based on soft constraints
   * @param {Object} timeSlot - The time slot
   * @param {Array} softWarnings - Soft constraint warnings
   * @returns {Number} Score for the time slot
   */
  static calculateSlotScore(timeSlot, softWarnings) {
    let score = 100; // Start with a perfect score
    
    // Deduct points for each soft warning
    for (const warning of softWarnings) {
      if (warning.type !== 'POSITIVE') {
        // Different weights for different constraints
        switch(warning.constraintId) {
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
        score += 5;
      }
    }
    
    // Prefer mornings over late afternoons
    const hour = timeSlot.start.getHours();
    if (hour < 12) {
      score += 5; // Slight preference for morning slots
    } else if (hour >= 15) {
      score -= 5; // Slight penalty for late afternoon
    }
    
    // Prefer mid-week over Monday/Friday
    const day = timeSlot.start.getDay();
    if (day === 2 || day === 3) { // Tuesday or Wednesday
      score += 3;
    } else if (day === 1 || day === 5) { // Monday or Friday
      score -= 2;
    }
    
    return score;
  }

  /**
   * Implement a cost function to evaluate overall schedule quality
   * @param {Array} schedule - The candidate schedule
   * @param {Object} problem - The scheduling problem
   * @returns {Object} Evaluation metrics for the schedule
   */
  static evaluateSchedule(schedule, problem) {
    // Count constraint violations
    let hardViolations = 0;
    let softViolations = 0;
    
    // Track which time slots are used for rooms and staff
    const roomBookings = {};
    const staffBookings = {};
    
    // Check room and staff conflicts
    schedule.forEach(event => {
      // Create unique identifiers for the time slots
      const day = event.start.toDateString();
      const timeRange = `${event.start.toTimeString()}-${event.end.toTimeString()}`;
      const timeSlot = `${day}:${timeRange}`;
      
      // Check room conflicts
      if (!roomBookings[event.roomId]) {
        roomBookings[event.roomId] = new Set();
      }
      
      if (roomBookings[event.roomId].has(timeSlot)) {
        hardViolations++;
      } else {
        roomBookings[event.roomId].add(timeSlot);
      }
      
      // Check staff conflicts
      if (!staffBookings[event.staffId]) {
        staffBookings[event.staffId] = new Set();
      }
      
      if (staffBookings[event.staffId].has(timeSlot)) {
        hardViolations++;
      } else {
        staffBookings[event.staffId].add(timeSlot);
      }
      
      // Check room capacity
      const room = problem.rooms.find(r => r.id === event.roomId);
      if (room && event.student_count > room.capacity) {
        hardViolations++;
      }
    });
    
    // Calculate resource utilization
    const resourceUtilization = this.calculateResourceUtilization(schedule, problem);
    
    // Calculate staff workload balance
    const staffWorkloadBalance = this.calculateStaffWorkloadBalance(schedule);
    
    // Calculate student experience (based on gaps, travel time between buildings, etc.)
    const studentExperience = this.calculateStudentExperience(schedule, problem);
    
    return {
      hardViolations,
      softViolations,
      resourceUtilization,
      staffWorkloadBalance,
      studentExperience,
      // Overall score - weighted combination of metrics
      score: 1000 * (hardViolations === 0 ? 1 : 0) - // Hard constraint multiplier
             softViolations * 10 +
             resourceUtilization * 100 +
             staffWorkloadBalance * 50 +
             studentExperience * 50
    };
  }

  /**
   * Calculate resource utilization percentage
   * @param {Array} schedule - The candidate schedule
   * @param {Object} problem - The scheduling problem
   * @returns {Number} Resource utilization percentage (0-1)
   */
  static calculateResourceUtilization(schedule, problem) {
    // Calculate total available room-hours
    const workingDays = 5; // Monday-Friday
    const workingHours = 8; // 9am-5pm
    const totalRoomHours = problem.rooms.length * workingDays * workingHours;
    
    // Calculate scheduled room-hours
    const scheduledRoomHours = schedule.reduce((sum, event) => {
      const hours = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    
    return Math.min(1, scheduledRoomHours / totalRoomHours);
  }

  /**
   * Calculate staff workload balance
   * @param {Array} schedule - The candidate schedule
   * @returns {Number} Balance score (0-1, higher is better)
   */
  static calculateStaffWorkloadBalance(schedule) {
    // Group events by staff
    const staffWorkloads = {};
    
    schedule.forEach(event => {
      if (!staffWorkloads[event.staffId]) {
        staffWorkloads[event.staffId] = 0;
      }
      
      const hours = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
      staffWorkloads[event.staffId] += hours;
    });
    
    // If no staff or only one, return perfect balance
    const staffIds = Object.keys(staffWorkloads);
    if (staffIds.length <= 1) return 1;
    
    // Calculate standard deviation of workloads
    const workloads = staffIds.map(id => staffWorkloads[id]);
    const avgWorkload = workloads.reduce((sum, w) => sum + w, 0) / workloads.length;
    const variance = workloads.reduce((sum, w) => sum + Math.pow(w - avgWorkload, 2), 0) / workloads.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert to a balance score (0-1)
    // A standard deviation of 0 is perfect balance (score 1)
    // Higher standard deviations result in lower scores
    const balance = 1 / (1 + stdDev);
    
    return balance;
  }

  /**
   * Calculate student experience score
   * @param {Array} schedule - The candidate schedule
   * @param {Object} problem - The scheduling problem
   * @returns {Number} Student experience score (0-1, higher is better)
   */
  static calculateStudentExperience(schedule, problem) {
    // For now, return a placeholder value
    // In a real implementation, this would consider:
    // - Building transitions (minimizing travel time)
    // - Gap lengths (not too short, not too long)
    // - Distribution throughout the week
    // - Back-to-back classes (some is good, too many is bad)
    return 0.8;
  }

  /**
   * Generate a candidate solution using a constructive heuristic
   * @param {Object} problem - The scheduling problem
   * @returns {Array} A candidate schedule
   */
  static generateInitialSolution(problem) {
    const { events, rooms, staff, existingEvents, timeSlots, preferences } = problem;
    const schedule = [];
    
    // Sort events by priority (more constrained first)
    const sortedEvents = [...events].sort((a, b) => {
      // Student count - higher count is harder to place
      const studentCountDiff = (b.student_count || 0) - (a.student_count || 0);
      
      // Specific room or staff preferences add constraints
      const aConstraints = (a.preferredRoomIds?.length || 0) + (a.preferredStaffIds?.length || 0);
      const bConstraints = (b.preferredRoomIds?.length || 0) + (b.preferredStaffIds?.length || 0);
      
      return studentCountDiff * 2 + (bConstraints - aConstraints);
    });
    
    // Try to schedule each event
    for (const event of sortedEvents) {
      let bestSlot = null;
      let bestRoom = null;
      let bestStaff = null;
      let bestScore = -Infinity;
      
      // Get eligible rooms (with sufficient capacity)
      const eligibleRooms = rooms.filter(room => room.capacity >= (event.student_count || 0));
      
      // Prioritize preferred rooms if specified
      const roomsToTry = event.preferredRoomIds && event.preferredRoomIds.length > 0
        ? [...eligibleRooms.filter(r => event.preferredRoomIds.includes(r.id)), ...eligibleRooms]
        : eligibleRooms;
      
      // Prioritize preferred staff if specified
      const staffToTry = event.preferredStaffIds && event.preferredStaffIds.length > 0
        ? [...staff.filter(s => event.preferredStaffIds.includes(s.id)), ...staff]
        : staff;
      
      // Try each room-staff-timeslot combination
      for (const room of roomsToTry) {
        for (const staffMember of staffToTry) {
          for (const slot of timeSlots) {
            // Check if this combination is valid
            const validation = this.validateCombination(
              event, room, staffMember, slot, [...existingEvents, ...schedule]
            );
            
            if (validation.valid) {
              // Calculate score based on preferences
              const slotScore = this.calculateSlotScore(slot, validation.softWarnings);
              
              // Add bonus for preferred room/staff
              let bonus = 0;
              if (event.preferredRoomIds && event.preferredRoomIds.includes(room.id)) {
                bonus += 20;
              }
              if (event.preferredStaffIds && event.preferredStaffIds.includes(staffMember.id)) {
                bonus += 20;
              }
              
              const totalScore = slotScore + bonus;
              
              // Keep track of the best option
              if (totalScore > bestScore) {
                bestScore = totalScore;
                bestSlot = slot;
                bestRoom = room;
                bestStaff = staffMember;
              }
            }
          }
        }
      }
      
      // If we found a valid slot, add it to the schedule
      if (bestSlot && bestRoom && bestStaff) {
        schedule.push({
          ...event,
          roomId: bestRoom.id,
          staffId: bestStaff.id,
          start: bestSlot.start,
          end: bestSlot.end,
          softWarnings: [] // We'd get these from validateCombination in the actual implementation
        });
      }
    }
    
    return schedule;
  }

  /**
   * Generate a neighboring solution by making small changes
   * @param {Array} solution - Current solution
   * @param {Object} problem - The scheduling problem
   * @returns {Array} A neighboring solution
   */
  static generateNeighbor(solution, problem) {
    if (solution.length === 0) return [];
    
    const neighbor = [...solution];
    
    // Pick a random event to modify
    const eventIndex = Math.floor(Math.random() * neighbor.length);
    const event = { ...neighbor[eventIndex] };
    
    // Choose what to modify (room, staff, or time)
    const changeType = Math.random();
    
    if (changeType < 0.33) {
      // Change room
      const eligibleRooms = problem.rooms.filter(r => r.capacity >= (event.student_count || 0));
      if (eligibleRooms.length > 0) {
        const newRoom = eligibleRooms[Math.floor(Math.random() * eligibleRooms.length)];
        event.roomId = newRoom.id;
      }
    } else if (changeType < 0.66) {
      // Change staff
      if (problem.staff.length > 0) {
        const newStaff = problem.staff[Math.floor(Math.random() * problem.staff.length)];
        event.staffId = newStaff.id;
      }
    } else {
      // Change time
      if (problem.timeSlots.length > 0) {
        const newSlot = problem.timeSlots[Math.floor(Math.random() * problem.timeSlots.length)];
        event.start = new Date(newSlot.start);
        event.end = new Date(newSlot.end);
      }
    }
    
    // Update the solution
    neighbor[eventIndex] = event;
    
    return neighbor;
  }

  /**
   * Calculate acceptance probability for worse solutions in simulated annealing
   * @param {Number} currentScore - Score of current solution
   * @param {Number} newScore - Score of new solution
   * @param {Number} temperature - Current temperature
   * @returns {Number} Probability of accepting the new solution
   */
  static getAcceptanceProbability(currentScore, newScore, temperature) {
    // If the new solution is better, always accept it
    if (newScore > currentScore) {
      return 1.0;
    }
    
    // If the temperature is very low, reject worse solutions
    if (temperature < 0.1) {
      return 0.0;
    }
    
    // Otherwise, calculate the acceptance probability
    return Math.exp((newScore - currentScore) / temperature);
  }

  /**
   * Implement simulated annealing to find an optimized schedule
   * @param {Object} problem - The scheduling problem
   * @returns {Object} Optimized schedule and evaluation
   */
  static simulatedAnnealing(problem, initialTemp = 100, coolingRate = 0.95, iterations = 1000) {
    // Generate an initial solution
    let currentSolution = this.generateInitialSolution(problem);
    let currentEvaluation = this.evaluateSchedule(currentSolution, problem);
    
    // Keep track of the best solution found
    let bestSolution = [...currentSolution];
    let bestEvaluation = {...currentEvaluation};
    
    // Initialize temperature
    let temperature = initialTemp;
    
    // Main simulated annealing loop
    for (let i = 0; i < iterations; i++) {
      // Generate a neighbor
      const neighbor = this.generateNeighbor(currentSolution, problem);
      
      // Evaluate the neighbor
      const neighborEval = this.evaluateSchedule(neighbor, problem);
      
      // Decide whether to accept the neighbor
      const acceptanceProbability = this.getAcceptanceProbability(
        currentEvaluation.score,
        neighborEval.score,
        temperature
      );
      
      if (Math.random() < acceptanceProbability) {
        currentSolution = neighbor;
        currentEvaluation = neighborEval;
        
        // Update best solution if current is better
        if (currentEvaluation.score > bestEvaluation.score) {
          bestSolution = [...currentSolution];
          bestEvaluation = {...currentEvaluation};
        }
      }
      
      // Cool down the temperature
      temperature *= coolingRate;
    }
    
    return {
      schedule: bestSolution,
      evaluation: bestEvaluation
    };
  }

  /**
   * Main optimization function for batch scheduling
   * @param {Array} eventsToSchedule - Events to be scheduled
   * @param {Object} preferences - Scheduling preferences
   * @returns {Promise<Object>} Optimized schedule and metrics
   */
  static async optimizeBatchSchedule(eventsToSchedule, preferences) {
    try {
      console.log(`Starting batch optimization for ${eventsToSchedule.length} events`);
      
      // Fetch scheduling data
      const { rooms, staff, existingEvents } = await this.fetchSchedulingData();
      
      // Generate time slots based on preferences
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 60); // Look 60 days ahead
      
      // Convert day preferences to numbers
      const daysToSchedule = preferences.daysOfWeek.map(d => parseInt(d));
      
      const timeSlots = this.generateTimeSlots(
        startDate, 
        endDate, 
        60, // Default duration
        daysToSchedule
      );
      
      // Create the scheduling problem
      const problem = {
        events: eventsToSchedule,
        rooms,
        staff,
        existingEvents,
        timeSlots,
        preferences
      };
      
      // Run simulated annealing
      const result = this.simulatedAnnealing(problem);
      
      // Map schedule back to the format expected by the frontend
      const scheduledEvents = result.schedule.map(event => ({
        id: event.id || this.generateEventId(),
        title: event.title,
        start: event.start,
        end: event.end,
        roomId: event.roomId,
        staffId: event.staffId,
        moduleId: event.moduleId,
        student_count: event.student_count,
        tag: event.tag || 'CLASS',
        students: event.students || []
      }));
      
      // Return the results
      return {
        success: result.evaluation.hardViolations === 0,
        scheduledEvents,
        unscheduledEvents: eventsToSchedule.filter(e => 
          !scheduledEvents.some(se => se.moduleId === e.moduleId)
        ),
        metrics: {
          resourceUtilization: Math.round(result.evaluation.resourceUtilization * 100),
          staffWorkloadBalance: Math.round(result.evaluation.staffWorkloadBalance * 100),
          studentExperience: Math.round(result.evaluation.studentExperience * 100),
          hardViolations: result.evaluation.hardViolations,
          softViolations: result.evaluation.softViolations
        }
      };
    } catch (error) {
      console.error('Error in batch optimization:', error);
      throw error;
    }
  }

  /**
   * Generate a unique event ID
   * @returns {String} Unique event ID
   */
  static generateEventId() {
    const prefix = 'EVT';
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${randomSuffix}`;
  }
}

module.exports = SchedulerOptimizer;