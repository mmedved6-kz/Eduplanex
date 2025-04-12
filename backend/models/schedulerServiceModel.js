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
  getAvailableRooms: async (start_time, end_time, requiredCapacity) => {
    try {
      // Get all rooms with sufficient capacity
      const rooms = await Room.getAll();
      const suitableRooms = rooms.filter(room => room.capacity >= requiredCapacity);
      
      // Check availability for each room
      const availableRooms = [];
      for (const room of suitableRooms) {
        const availability = await Constraint.checkRoomAvailability(
          room.id, 
          start_time, 
          end_time
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
  getAvailableStaff: async (start_time, end_time, departmentId = null) => {
    try {
      // Get all staff or filter by department
      const query = departmentId ? { departmentId } : {};
      const staff = await Staff.getAll(1000, 0, '', 'staff.id', 'ASC', query);
      
      // Check availability for each staff member
      const availableStaff = [];
      for (const member of staff) {
        const availability = await Constraint.checkStaffAvailability(
          member.id, 
          start_time, 
          end_time
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
  
  findAvailableTimeSlot: async (eventData, maxAttempts = 5) => {
    console.log("Finding available time slot for: ", eventData.title);
    
    // Determine original requested time if provided
    let preferredStart = eventData.start ? new Date(eventData.start) : null;
    let preferredEnd = eventData.end ? new Date(eventData.end) : null;
    
    // If preferred time is specified, try that first
    if (preferredStart && preferredEnd) {
      // Try the preferred time slot
      const availableRooms = await SchedulerService.getAvailableRooms(
        preferredStart, 
        preferredEnd, 
        eventData.student_count || 0
      );
      
      // Get module info to find appropriate staff
      const moduleInfo = await Module.getById(eventData.moduleId);
      const departmentId = moduleInfo?.departmentid;
      
      const availableStaff = await SchedulerService.getAvailableStaff(
        preferredStart, 
        preferredEnd, 
        departmentId
      );
      
      if (availableRooms.length > 0 && availableStaff.length > 0) {
        return {
          success: true,
          start: preferredStart,
          end: preferredEnd,
          availableRooms,
          availableStaff
        };
      }
      
      console.log("Preferred time slot not available, trying alternatives...");
    }
    
    // Calculate duration to maintain for alternative slots
    const durationMinutes = preferredStart && preferredEnd ? 
      Math.floor((preferredEnd - preferredStart) / (1000 * 60)) : 60; // Default to 1 hour
    
    // Try different time slots
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Generate a random day (Monday - Friday)
      const day = Math.floor(Math.random() * 5) + 1; // 1 = Monday, 5 = Friday
      
      // Generate a random time between 9:00 and 16:00
      // Using if-else and randomization for a more "student-like" approach
      let hour, minute;
      
      if (Math.random() < 0.7) {
        // 70% chance to be during core hours (10:00-15:00)
        hour = 10 + Math.floor(Math.random() * 5);
      } else {
        // 30% chance to be early or late
        if (Math.random() < 0.5) {
          hour = 9; // Early morning
        } else {
          hour = 15 + Math.floor(Math.random() * 2); // Late afternoon (15:00-16:00)
        }
      }
      
      // Generate minutes (0, 15, 30, 45)
      if (Math.random() < 0.7) {
        // 70% chance for "standard" start times
        minute = Math.random() < 0.5 ? 0 : 30;
      } else {
        // 30% chance for "odd" start times
        minute = Math.random() < 0.5 ? 15 : 45;
      }
      
      // Create date objects for the start and end times
      const tryStart = new Date();
      // Set to next occurrence of the selected day
      tryStart.setDate(tryStart.getDate() + (day - tryStart.getDay() + 7) % 7);
      tryStart.setHours(hour, minute, 0, 0);
      
      const tryEnd = new Date(tryStart);
      tryEnd.setMinutes(tryEnd.getMinutes() + durationMinutes);
      
      console.log(`Trying time slot: ${tryStart.toISOString()} - ${tryEnd.toISOString()}`);
      
      // Check if this time slot works
      const availableRooms = await SchedulerService.getAvailableRooms(
        tryStart, 
        tryEnd, 
        eventData.student_count || 0
      );
      
      // Get module info to find appropriate staff
      const moduleInfo = await Module.getById(eventData.moduleId);
      const departmentId = moduleInfo?.departmentid;
      
      const availableStaff = await SchedulerService.getAvailableStaff(
        tryStart, 
        tryEnd, 
        departmentId
      );
      
      if (availableRooms.length > 0 && availableStaff.length > 0) {
        console.log(`Found available time slot on attempt ${attempt + 1}`);
        return {
          success: true,
          start: tryStart,
          end: tryEnd,
          availableRooms,
          availableStaff
        };
      }
      
      console.log(`Attempt ${attempt + 1} failed, trying another time slot...`);
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
      const { title, start, end, student_count, moduleId, preferredRoomIds = [], preferredStaffIds = [] } = eventData;
      
      // Find available rooms
      const availableRooms = await SchedulerService.getAvailableRooms(start, end, student_count);
      
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
      const availableStaff = await SchedulerService.getAvailableStaff(start, end, departmentId);
      
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
        start_time: start,
        end_time: end,
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