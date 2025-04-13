const Constraint = require('../models/constraintModel');
const Event = require('../models/eventModel');
const Room = require('../models/roomModel');
const Module = require('../models/moduleModel');
const Staff = require('../models/staffModel');

/**
 * Service for scheduling optimization algorithms
 */
const SchedulerService = {
  /**
   * Get available rooms for a given time slot and capacity
   */
  getAvailableRooms: async (date, timeslotId, requiredCapacity) => {
    try {
      // Get all rooms with sufficient capacity
      const rooms = await Room.getAll(1000, 0, '', 'room.capacity', 'ASC', {
        minCapacity: requiredCapacity
      });
      
      const suitableRooms = rooms.filter(room => room.capacity >= requiredCapacity);
      
      // Check availability for each room on this date and timeslot
      const availableRooms = [];
      for (const room of suitableRooms) {
        const availability = await Constraint.checkRoomAvailability(
          room.id, 
          date, 
          timeslotId
        );
        
        if (availability.available) {
          availableRooms.push(room);
        }
      }
      
      return availableRooms;
    } catch (error) {
      console.error('Error finding available rooms:', error);
      throw error;
    }
  },
  
  /**
   * Get available staff for a given time slot
   */
  getAvailableStaff: async (date, timeslotId, departmentId = null) => {
    try {
      // Get all staff or filter by department
      const query = departmentId ? { departmentId } : {};
      const staff = await Staff.getAll(1000, 0, '', 'staff.id', 'ASC', query);
      
      // Check availability for each staff member
      const availableStaff = [];
      for (const member of staff) {
        const availability = await Constraint.checkStaffAvailability(
          member.id, 
          date, 
          timeslotId
        );
        
        if (availability.available) {
          availableStaff.push(member);
        }
      }
      
      return availableStaff;
    } catch (error) {
      console.error('Error finding available staff:', error);
      throw error;
    }
  },

  getAvailableSlots: async (date, requiredCapacity, roomId = null, staffId = null) => {
    try {
      // Get available timeslots for the date
      const timeslots = await Timeslot.findAvailable(
        date,
        roomId,
        staffId,
        requiredCapacity
      );
      
      return timeslots.map(ts => ({
        timeslotId: ts.id,
        startTime: ts.start_time,
        endTime: ts.end_time,
        duration: ts.duration_minutes
      }));
    } catch (error) {
      console.error('Error finding available timeslots:', error);
      throw error;
    }
  },
  
  findAvailableTimeSlot: async (eventData, maxAttempts = 5) => {
    console.log("Finding available time slot for: ", eventData.title);
    
    // Determine preferred date and timeslot if provided
    let preferredDate = eventData.event_date ? new Date(eventData.event_date) : null;
    let preferredTimeslotId = eventData.timeslot_id || null;
    
    // If preferred date and timeslot are specified, try that first
    if (preferredDate && preferredTimeslotId) {
      // Get the timeslot details
      const timeslot = await db.oneOrNone('SELECT * FROM timeslot WHERE id = $1', [preferredTimeslotId]);
      
      if (!timeslot) {
        return {
          success: false,
          message: 'Invalid timeslot specified'
        };
      }
      
      // Try the preferred date and timeslot
      const availableRooms = await SchedulerService.getAvailableRooms(
        preferredDate.toISOString().split('T')[0],
        preferredTimeslotId,
        eventData.student_count || 0
      );
      
      // Get module info to find appropriate staff
      const moduleInfo = await Module.getById(eventData.moduleId);
      const departmentId = moduleInfo?.departmentid;
      
      const availableStaff = await SchedulerService.getAvailableStaff(
        preferredDate.toISOString().split('T')[0],
        preferredTimeslotId,
        departmentId
      );
      
      if (availableRooms.length > 0 && availableStaff.length > 0) {
        return {
          success: true,
          date: preferredDate.toISOString().split('T')[0],
          timeslotId: preferredTimeslotId,
          timeslot: timeslot,
          availableRooms,
          availableStaff
        };
      }
      
      console.log("Preferred date and timeslot not available, trying alternatives...");
    }
    
    // Get required duration from event data or use default
    const desiredDuration = eventData.duration_minutes || 60;
    
    // Generate potential dates (next 30 days, focusing on weekdays)
    const potentialDates = [];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (day.getDay() !== 0 && day.getDay() !== 6) {
        potentialDates.push(new Date(day));
      }
    }
    
    // Try different date and timeslot combinations
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Pick a random date from potential dates
      const randomDateIndex = Math.floor(Math.random() * potentialDates.length);
      const tryDate = potentialDates[randomDateIndex];
      const dateStr = tryDate.toISOString().split('T')[0];
      
      // Get suitable timeslots for this date (closest to the desired duration)
      const suitableTimeslots = await db.any(
        `SELECT * FROM timeslot 
         WHERE ABS(duration_minutes - $1) <= 30
         ORDER BY ABS(duration_minutes - $1), start_time`,
        [desiredDuration]
      );
      
      if (suitableTimeslots.length === 0) {
        continue; // No suitable timeslots found for the duration
      }
      
      // Try each timeslot until we find an available one
      for (const timeslot of suitableTimeslots) {
        // Check availability for this date and timeslot
        const availableRooms = await SchedulerService.getAvailableRooms(
          dateStr,
          timeslot.id,
          eventData.student_count || 0
        );
        
        if (availableRooms.length === 0) continue;
        
        // Get module info to find appropriate staff
        const moduleInfo = await Module.getById(eventData.moduleId);
        const departmentId = moduleInfo?.departmentid;
        
        const availableStaff = await SchedulerService.getAvailableStaff(
          dateStr,
          timeslot.id,
          departmentId
        );
        
        if (availableStaff.length > 0) {
          console.log(`Found available time slot on attempt ${attempt + 1}`);
          return {
            success: true,
            date: dateStr,
            timeslotId: timeslot.id,
            timeslot: timeslot,
            availableRooms,
            availableStaff
          };
        }
      }
      
      console.log(`Attempt ${attempt + 1} failed, trying another date...`);
    }
    
    console.log(`Failed to find available time slot after ${maxAttempts} attempts`);
    return {
      success: false,
      message: `Could not find available time slot after ${maxAttempts} attempts`
    };
  },

  /**
   * Simple greedy algorithm to schedule an event
   * Tries to find an available room and staff member for the desired time
   */
  scheduleEvent: async (eventData) => {
    try {
      const { title, event_date, timeslot_id, student_count, moduleId, preferredRoomIds = [], preferredStaffIds = [] } = eventData;
      
      const timeslot = await Timeslot.getById(timeslot_id);
      if (!timeslot) {
        return {
          success: false,
          message: 'Invalid timeslot specified'
        };
      }

      // Find available rooms
      const availableRooms = await SchedulerService.getAvailableRooms(
        event_date,
        timeslot_id,
        student_count
      );
      
      if (availableRooms.length === 0) {
        return {
          success: false,
          message: 'No available rooms with sufficient capacity'
        };
      }
      
      // Prioritize preferred rooms if available
      let selectedRoom;
      if (preferredRoomIds.length > 0) {
        selectedRoom = availableRooms.find(room => preferredRoomIds.includes(room.id));
      }
      
      // If no preferred room is available, take the first available
      if (!selectedRoom) {
        selectedRoom = availableRooms[0];
      }
      
      // Get module info to find appropriate staff
      const moduleInfo = await Module.getById(moduleId);
      const departmentId = moduleInfo?.departmentId;
      
      // Find available staff
      const availableStaff = await SchedulerService.getAvailableStaff(
        event_date,
        timeslot_id,
        departmentId
      );
      
      if (availableStaff.length === 0) {
        return {
          success: false,
          message: 'No available staff members'
        };
      }
      
      // Prioritize preferred staff if available
      let selectedStaff;
      if (preferredStaffIds.length > 0) {
        selectedStaff = availableStaff.find(staff => preferredStaffIds.includes(staff.id));
      }
      
      // If no preferred staff is available, take the first available
      if (!selectedStaff) {
        selectedStaff = availableStaff[0];
      }
      
      // Create the event
      const newEvent = await Event.create({
        title,
        event_date,
        timeslot_id,
        roomId: selectedRoom.id,
        staffId: selectedStaff.id,
        moduleId,
        student_count
      });
      
      return {
        success: true,
        event: newEvent
      };
    } catch (error) {
      console.error('Error scheduling event:', error);
      return {
        success: false,
        message: `Error scheduling event: ${error.message}`
      };
    }
  },
  
  /**
   * Schedule multiple events at once
   */
  batchSchedule: async (events) => {
    console.log(`Starting batch scheduling for ${events.length} events`);
    
    // Sort events by priority
    // This is a simple optimization approach - schedule the more constrained events first
    const sortedEvents = [...events].sort((a, b) => {
      // Higher student count is higher priority
      const studentCountA = a.student_count || 0;
      const studentCountB = b.student_count || 0;
      
      // Specific room preference gives higher priority
      const roomPriorityA = a.preferredRoomIds && a.preferredRoomIds.length > 0 ? 1 : 0;
      const roomPriorityB = b.preferredRoomIds && b.preferredRoomIds.length > 0 ? 1 : 0;
      
      // Combine factors (student count has higher weight)
      return (studentCountB * 2 + roomPriorityB) - (studentCountA * 2 + roomPriorityA);
    });
    
    const results = [];
    const failedEvents = [];
    
    // First pass: schedule events
    for (const eventData of sortedEvents) {
      console.log(`Attempting to schedule event: ${eventData.title}`);
      
      const result = await SchedulerService.scheduleEvent(eventData);
      
      if (result.success) {
        results.push({
          eventData,
          success: true,
          event: result.event,
          softWarnings: result.softWarnings
        });
      } else {
        console.log(`Failed to schedule event: ${eventData.title}`);
        failedEvents.push(eventData);
      }
    }
    
    // Second pass: try harder to schedule failed events
    // This is a basic form of backtracking
    for (const eventData of failedEvents) {
      console.log(`Retrying failed event: ${eventData.title} with more attempts`);
      
      // Try up to 10 different time slots
      const result = await SchedulerService.scheduleEvent({
        ...eventData,
        maxAttempts: 10
      });
      
      if (result.success) {
        results.push({
          eventData,
          success: true,
          event: result.event,
          softWarnings: result.softWarnings
        });
      } else {
        results.push({
          eventData,
          success: false,
          message: result.message
        });
      }
    }
    
    // Count successful and failed events
    const totalSuccess = results.filter(r => r.success).length;
    const totalFailure = results.length - totalSuccess;
    
    console.log(`Batch scheduling completed: ${totalSuccess} succeeded, ${totalFailure} failed`);
    
    return {
      totalSuccess,
      totalFailure,
      results
    };
  }
};

module.exports = SchedulerService;