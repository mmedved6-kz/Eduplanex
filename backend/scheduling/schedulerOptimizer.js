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
    static generateTimeSlots(start_time, end_time, durationMinutes = 60, daysToInclude = [1, 2, 3, 4, 5]) {
        const slots = [];
        const start = new Date(start_time);
        const end = new Date(end_time);

        // Iterate through each day in the range
        for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
            for (let hour = 8; hour < 17; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    const slotStart = new Date(day);
                    slotStart.setHours(hour, minute, 0, 0);

                    const slotEnd = new Date(day);
                    slotEnd.setHours(slotStart.getMinutes() + durationMinutes);

                    if (slotEnd.getHours() < 18) {
                        slots.push({
                            start: slotStart,
                            end: slotEnd,
                        })
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
            const rooms = await Room.getAll(1000, 0, '', 'room.id', 'ASC', {});

            const staff = await Staff.getAll(1000, 0, '', 'staff.id', 'ASC', {});

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 60);

            const events = await Event.getAll(1000, 0, '', 'event.start_time', 'ASC', {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            });

            return {
                rooms,
                staff,
                existingEvents: events.map(event => ({
                    id: event.id,
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
     * Check if the combination of event, room, staff and time is valid 
     * @param {*} event 
     * @param {*} room 
     * @param {*} staff 
     * @param {*} timeslot 
     * @param {*} existingEvents 
     */
    static async validateCombination(event, room, staff, timeslot, existingEvents) {

    }


    /**
        * Find valid timeslots for the given event, room and staff
        * @param {*} event 
        * @param {*} room 
        * @param {*} staff 
        * @param {*} timeslot 
        * @param {*} existingEvents 
    */  
    static async findValidTimeslots(event, room, staff, timeslot, existingEvents) {

    }

    static resourceUtilizationCalculation(schedule, problem) {

    }

    static calculateStaffWorkloadBalance(schedule) {
        
    }

}