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
  
  static generateEventId() {
    const prefix = 'EVT';
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${randomSuffix}`;
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
    const sameDayEvents = existingEvents.filter(e => {
      // Ensure e.start is a Date object
      const eStart = e.start instanceof Date ? e.start : new Date(e.start);
      return e.staffId === staffMember.id &&
             eStart.toDateString() === timeSlot.start.toDateString();
    });
    
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
   * Calculate slot score based on soft constraints
   * @param {Object} timeSlot - Time slot to score
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
      const dateTimeslotKey = `${event.event_date}:${event.timeslot_id}`;
      
      // Check room conflicts
      if (!roomBookings[event.roomId]) {
        roomBookings[event.roomId] = new Set();
      }
      
      if (roomBookings[event.roomId].has(dateTimeslotKey)) {
        hardViolations++;
      } else {
        roomBookings[event.roomId].add(dateTimeslotKey);
      }
      
      // Check staff conflicts
      if (!staffBookings[event.staffId]) {
        staffBookings[event.staffId] = new Set();
      }
      
      if (staffBookings[event.staffId].has(dateTimeslotKey)) {
        hardViolations++;
      } else {
        staffBookings[event.staffId].add(dateTimeslotKey);
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
    
    // Calculate student experience
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
      // Ensure event.start and event.end are Date objects
      const start = event.start instanceof Date ? event.start : new Date(event.start);
      const end = event.end instanceof Date ? event.end : new Date(event.end);
      
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
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
      
      // Ensure event.start and event.end are Date objects
      const start = event.start instanceof Date ? event.start : new Date(event.start);
      const end = event.end instanceof Date ? event.end : new Date(event.end);
      
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
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
    // Can include:
    // - Building transitions (minimizing travel time)
    // - Gap lengths (not too short, not too long)
    // - Distribution of events throughout the week
    // - Back-to-back classes (some is good, too many is bad)
    return 0.8; // Default score for now
  }

  /**
   * Main method for batch scheduling using genetic algorithm
   * @param {Array} eventsToSchedule - Events to be scheduled
   * @param {Object} preferences - Scheduling preferences
   * @returns {Promise<Object>} Optimized schedule and metrics
   */
  static async optimizeBatchScheduleGenetic(eventsToSchedule, preferences) {
    try {
      console.log(`Starting genetic algorithm optimization for ${eventsToSchedule.length} events`);
      
      const cleanEvents = eventsToSchedule.map(event => {
          const { start, end, ...cleanEvent } = event;
          return cleanEvent;
      });

      // Fetch scheduling data
      const { rooms, staff, existingEvents } = await this.fetchSchedulingData();
      
      // Generate time slots based on preferences
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 60); // Look 60 days ahead
      
      // Convert day preferences to numbers
      const daysToSchedule = preferences.daysOfWeek.map(d => parseInt(d));
      
      const allTimeslots = await db.any('SELECT * FROM timeslot ORDER BY start_time');

      const timeSlots = [];
      for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
        if (!daysToSchedule.includes(day.getDay())) continue;

        const dateStr = day.toISOString().split('T')[0];

        for (const timeslot of allTimeslots) {
          if (preferences.timeRange !== 'any') {
            const hour = parseInt(timeslot.start_time.split(':')[0]);
            if (preferences.timeRange === 'morning' && hour >= 12) continue;
            if (preferences.timeRange === 'afternoon' && hour < 12) continue;
          }

          timeSlots.push({
            date: dateStr,
            timeslotId: timeslot.id,
            start: new Date(`${dateStr}T${timeslot.start_time}`),
            end: new Date(`${dateStr}T${timeslot.end_time}`),
            timeslot: timeslot
          });
        }
      }

      const availableSlots = [];
      for (const slot of timeSlots) {
        const hasConflict = existingEvents.some(event => 
          event.event_date === slot.date &&
          event.timeslot_id === slot.timeslotId
        );

        if (!hasConflict) {
          availableSlots.push(slot);
        }
      }

      console.log(`Generated ${availableSlots.length} available slots for scheduling`);
      
      // Create the scheduling problem definition
      const problem = {
        events: cleanEvents,
        rooms,
        staff,
        existingEvents,
        timeSlots,
        preferences
      };
      
      // Run genetic algorithm
      const result = await this.runGeneticAlgorithm(problem);
      
      // Map scheduled events to format expected by frontend
      const scheduledEvents = result.bestChromosome.genes.map(gene => {
        return {
          id: gene.event.id || this.generateEventId(),
          title: gene.event.title,
          event_date: gene.timeSlot.date,
          timeslot_id: gene.timeSlot.timeslotId,
          roomId: gene.room.id,
          staffId: gene.staff.id,
          moduleId: gene.event.moduleId,
          student_count: gene.event.student_count,
          tag: gene.event.tag || 'CLASS',
          students: gene.event.students || []
        }
      });
      
      // Identify events that couldn't be scheduled
      const scheduledModuleIds = scheduledEvents.map(e => e.moduleId);
      const unscheduledEvents = cleanEvents.filter(e => 
        !scheduledModuleIds.includes(e.moduleId)
      );
      
      // Return results
      return {
        success: result.metrics.hardViolations === 0,
        scheduledEvents,
        unscheduledEvents,
        metrics: {
          resourceUtilization: Math.round(result.metrics.resourceUtilization * 100),
          staffWorkloadBalance: Math.round(result.metrics.staffWorkloadBalance * 100),
          studentExperience: Math.round(result.metrics.studentExperience * 100),
          hardViolations: result.metrics.hardViolations,
          softViolations: result.metrics.softViolations
        }
      };
    } catch (error) {
      console.error('Error in genetic algorithm optimization:', error);
      throw error;
    }
  }

  /**
   * Initialize population with random chromosomes
   * @param {Number} size - Population size
   * @param {Object} problem - Problem definition
   * @returns {Promise<Array>} Initial population
   */
  static async initializePopulation(size, problem) {
    const population = [];
    
    for (let i = 0; i < size; i++) {
      // A chromosome is an array of genes, each representing an event assignment
      const chromosome = { genes: [] };
      
      for (const event of problem.events) {
        // For each event, randomly assign room, staff, and time slot
        const eligibleRooms = problem.rooms.filter(r => r.capacity >= (event.student_count || 0));
        
        if (eligibleRooms.length === 0) continue; // Skip if no room has enough capacity
        
        const room = this.getRandomElement(eligibleRooms);
        const staff = this.getRandomElement(problem.staff);
        const timeSlot = this.getRandomElement(problem.timeSlots);
        
        // Skip if we couldn't find valid resources
        if (!room || !staff || !timeSlot) continue;
        
        // Create a gene for this event
        chromosome.genes.push({
          event,
          room,
          staff,
          timeSlot
        });
      }
      
      population.push(chromosome);
    }
    
    return population;
  }

  /**
   * Helper to get random element from array
   * @param {Array} array - Array to select from
   * @returns {*} Random element
   */
  static getRandomElement(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Evaluate fitness of a chromosome
   * @param {Object} chromosome - Chromosome to evaluate
   * @param {Object} problem - Problem definition
   * @returns {Promise<Number>} Fitness score
   */
  static async evaluateFitness(chromosome, problem) {
    // Convert chromosome to schedule format
    const schedule = chromosome.genes.map(gene => ({
      ...gene.event,
      roomId: gene.room.id,
      staffId: gene.staff.id,
      start: gene.timeSlot.start,
      end: gene.timeSlot.end
    }));

    const evaluation = await this.evaluateSchedule(schedule, problem);
    
    let fitness = 10000;

     // Hard constraints are critical - major penalty for violations
    fitness -= evaluation.hardViolations * 1000;
  
    // Room utilization score - reward efficient use of rooms
    fitness += evaluation.resourceUtilization * 100;
    
    // Staff workload balance - reward even distribution of teaching
    fitness += evaluation.staffWorkloadBalance * 100;
    
    // Student experience - reward good scheduling for students
    fitness += evaluation.studentExperience * 100;
    
    // Soft constraints - smaller penalties
    fitness -= evaluation.softViolations * 10;
  
    // Store the detailed metrics for reporting
    chromosome.evaluationDetails = evaluation;
    chromosome.fitness = fitness;
  
    return fitness;
  }

  /**
   * Tournament selection for genetic algorithm
   * @param {Array} population - Current population
   * @param {Array} fitnessScores - Fitness scores
   * @param {Number} selectionSize - Number of chromosomes to select
   * @returns {Array} Selected chromosomes
   */
  static tournamentSelection(population, fitnessScores, selectionSize) {
    const selected = [];
    const tournamentSize = 3;

    const selectionPressure = {};
    
    while (selected.length < selectionSize) {
      // Select random individuals for tournament
      const tournamentIndices = [];
      for (let i = 0; i < tournamentSize; i++) {
        tournamentIndices.push(Math.floor(Math.random() * population.length));
      }
      
      // Find the best individual in the tournament
      let bestIndex = tournamentIndices[0];
      for (let i = 1; i < tournamentIndices.length; i++) {
        if (fitnessScores[tournamentIndices[i]] > fitnessScores[bestIndex]) {
          bestIndex = tournamentIndices[i];
        }
      }
      
      if (selectionPressure[bestIndex] && selectionPressure[bestIndex] > 3 && Math.random() < 0.3) {
        let secondBestIndex = -1;
        let secondBestScore = -Infinity;
        
        for (let i = 0; i < tournamentIndices.length; i++) {
          const idx = tournamentIndices[i];
          if (idx !== bestIndex && fitnessScores[idx] > secondBestScore) {
            secondBestIndex = idx;
            secondBestScore = fitnessScores[idx];
          }
        }
        
        if (secondBestIndex !== -1) {
          bestIndex = secondBestIndex;
        }
      }
      
      // Update selection pressure counter
      selectionPressure[bestIndex] = (selectionPressure[bestIndex] || 0) + 1;
      
      // Add winner to selected individuals (deep clone to avoid reference issues)
      selected.push(JSON.parse(JSON.stringify(population[bestIndex])));
    }
    
    return selected;
  }

  /**
   * Crossover operator for genetic algorithm
   * @param {Object} parent1 - First parent chromosome
   * @param {Object} parent2 - Second parent chromosome
   * @returns {Array} Two child chromosomes
   */
  static crossover(parent1, parent2) {
    // Create child chromosomes
    const child1 = { genes: [] };
    const child2 = { genes: [] };
    
    // Map events to make lookup easier
    const eventMap1 = {};
    const eventMap2 = {};
    
    parent1.genes.forEach(gene => {
      eventMap1[gene.event.moduleId] = gene;
    });
    
    parent2.genes.forEach(gene => {
      eventMap2[gene.event.moduleId] = gene;
    });

    const groupedEvents = this.groupEventsByRelationship([...parent1.genes, ...parent2.genes]);
    
    Object.values(groupedEvents).forEach(eventIds => {
      const useParent1 = Math.random() < 0.5;
      
      if (useParent1) {
        // Child 1 inherits this group from parent 1, child 2 from parent 2
        eventIds.forEach(id => {
          if (eventMap1[id]) child1.genes.push(JSON.parse(JSON.stringify(eventMap1[id])));
          if (eventMap2[id]) child2.genes.push(JSON.parse(JSON.stringify(eventMap2[id])));
        });
      } else {
        // Child 1 inherits this group from parent 2, child 2 from parent 1
        eventIds.forEach(id => {
          if (eventMap2[id]) child1.genes.push(JSON.parse(JSON.stringify(eventMap2[id])));
          if (eventMap1[id]) child2.genes.push(JSON.parse(JSON.stringify(eventMap1[id])));
        });
      }
    });
    
    return [child1, child2];
  }

  /**
    * Group events by relationship to keep related events together during crossover
  */
  static groupEventsByRelationship(genes) {
    const groups = {};
  
    // Group by course and staff
    genes.forEach(gene => {
      let groupKey;
    
      if (gene.event.courseId) {
        groupKey = `course-${gene.event.courseId}`;
      } else if (gene.event.staffId) {
        groupKey = `staff-${gene.event.staffId}`;
      } else {
        groupKey = `module-${gene.event.moduleId}`;
      }
    
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
    
      if (!groups[groupKey].includes(gene.event.moduleId)) {
        groups[groupKey].push(gene.event.moduleId);
      }
    });
  
    return groups;
  }

  /**
   * Mutation operator for genetic algorithm
   * @param {Object} chromosome - Chromosome to mutate
   * @param {Object} problem - Problem definition
   * @param {Number} mutationRate - Current mutation rate
   * @param {Number} generation - Current generation number
   * @returns {Object} Mutated chromosome
   */
  static mutate(chromosome, problem, mutationRate, generation) {
    // Clone chromosome to avoid modifying original
    const mutated = JSON.parse(JSON.stringify(chromosome));
    
    // Select a random gene
    if (mutated.genes.length === 0) return mutated;
    
    const adaptiveMutationRate = mutationRate * (1 + (generation / 50));
    
    for (let i = 0; i < mutated.genes.length; i++) {
      if (Math.random() > adaptiveMutationRate) continue;
      
      const gene = mutated.genes[i];
      
      // Select what to mutate based on potential issues
      const mutationType = this.selectMutationType(gene, mutated.genes);
      
      switch (mutationType) {
        case 'room':
          // Select rooms with sufficient capacity
          const eligibleRooms = problem.rooms.filter(r => r.capacity >= gene.event.student_count || 0);
          if (eligibleRooms.length > 0) {
            gene.room = this.getRandomElement(eligibleRooms);
          }
          break;
          
        case 'staff':
          // Try to assign appropriate staff
          if (problem.staff.length > 0) {
            gene.staff = this.getRandomElement(problem.staff);
          }
          break;
          
        case 'time':
          // Change time slot
          if (problem.timeSlots.length > 0) {
            gene.timeSlot = this.getRandomElement(problem.timeSlots);
          }
          break;
      }
    }
    
    return mutated;
  }

  /**
   * Generate a unique event ID
   * @returns {String} Unique event ID
   */
  /**
 * Intelligence mutation type selection based on constraint issues
 */
static selectMutationType(gene, allGenes) {
  // Check for room capacity issues
  const hasCapacityIssue = gene.room.capacity < gene.event.student_count;
  
  // Check for room conflicts
  const hasRoomConflict = allGenes.some(otherGene => 
    otherGene !== gene && 
    otherGene.room.id === gene.room.id && 
    this.timeslotsOverlap(otherGene.timeSlot, gene.timeSlot)
  );
  
  // Check for staff conflicts
  const hasStaffConflict = allGenes.some(otherGene => 
    otherGene !== gene && 
    otherGene.staff.id === gene.staff.id && 
    this.timeslotsOverlap(otherGene.timeSlot, gene.timeSlot)
  );
  
  // Choose mutation type based on issues
  if (hasCapacityIssue) {
    return 'room'; // Change room if capacity is insufficient
  } else if (hasRoomConflict) {
    return Math.random() < 0.7 ? 'room' : 'time'; // Either change room or time
  } else if (hasStaffConflict) {
    return Math.random() < 0.7 ? 'time' : 'staff'; // Prefer changing time over staff
  } else {
    // Random mutation if no specific issues
    const types = ['room', 'staff', 'time'];
    return types[Math.floor(Math.random() * types.length)];
  }
}

/**
 * Check if two timeslots overlap
 */
static timeslotsOverlap(ts1, ts2) {
  // Get start and end times in a comparable format
  const getTimeAsMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const start1 = ts1.start_time ? getTimeAsMinutes(ts1.start_time) : 0;
  const end1 = ts1.end_time ? getTimeAsMinutes(ts1.end_time) : 0;
  const start2 = ts2.start_time ? getTimeAsMinutes(ts2.start_time) : 0;
  const end2 = ts2.end_time ? getTimeAsMinutes(ts2.end_time) : 0;
  
  return start1 < end2 && start2 < end1;
}

/**
 * Enhanced genetic algorithm with improved tracking
 */
static async runGeneticAlgorithm(problem) {
  // Algorithm parameters
  const populationSize = 50;
  const generations = 100;
  const baseMutationRate = 0.1;
  const crossoverRate = 0.8;
  const eliteCount = 5; // Number of best chromosomes to preserve unchanged
  
  console.log(`Running enhanced genetic algorithm with population ${populationSize}, generations ${generations}`);
  
  // Initialize population
  let population = await this.initializePopulation(populationSize, problem);
  let bestChromosome = null;
  let bestFitness = -Infinity;
  
  // Tracking metrics for visualization
  const metrics = {
    generationBestFitness: [],
    generationAvgFitness: [],
    hardViolationsPerGeneration: [],
    softViolationsPerGeneration: [],
    resourceUtilization: [],
    workloadBalance: []
  };
  
  // Evolution over generations
  for (let gen = 0; gen < generations; gen++) {
    // Evaluate fitness for all chromosomes
    const fitnessScores = [];
    const evaluations = [];
    
    for (const chromosome of population) {
      const fitness = await this.evaluateFitness(chromosome, problem);
      fitnessScores.push(fitness);
      evaluations.push(chromosome.evaluationDetails);
    }
    
    // Track metrics for this generation
    const avgFitness = fitnessScores.reduce((sum, f) => sum + f, 0) / fitnessScores.length;
    const genBestIndex = fitnessScores.indexOf(Math.max(...fitnessScores));
    const genBestFitness = fitnessScores[genBestIndex];
    
    metrics.generationBestFitness.push(genBestFitness);
    metrics.generationAvgFitness.push(avgFitness);
    
    // Track constraint violations
    const avgHardViolations = evaluations.reduce((sum, e) => sum + e.hardViolations, 0) / evaluations.length;
    const avgSoftViolations = evaluations.reduce((sum, e) => sum + e.softViolations, 0) / evaluations.length;
    
    metrics.hardViolationsPerGeneration.push(avgHardViolations);
    metrics.softViolationsPerGeneration.push(avgSoftViolations);
    
    // Track resource metrics
    metrics.resourceUtilization.push(
      evaluations.reduce((sum, e) => sum + e.resourceUtilization, 0) / evaluations.length
    );
    metrics.workloadBalance.push(
      evaluations.reduce((sum, e) => sum + e.staffWorkloadBalance, 0) / evaluations.length
    );
    
    // Find best chromosome overall
    if (genBestFitness > bestFitness) {
      bestFitness = genBestFitness;
      bestChromosome = JSON.parse(JSON.stringify(population[genBestIndex]));
    }
    
    // Sort population by fitness for elitism
    const sortedIndices = fitnessScores
      .map((score, idx) => ({ score, idx }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.idx);
      
    const elites = sortedIndices.slice(0, eliteCount).map(idx => 
      JSON.parse(JSON.stringify(population[idx]))
    );
    
    // Selection - tournament selection
    const selected = this.tournamentSelection(population, fitnessScores, populationSize - eliteCount);
    
    // Crossover
    const offspring = [];
    for (let i = 0; i < selected.length; i += 2) {
      if (i + 1 < selected.length && Math.random() < crossoverRate) {
        const [child1, child2] = this.crossover(selected[i], selected[i + 1]);
        offspring.push(child1, child2);
      } else {
        offspring.push(selected[i]);
        if (i + 1 < selected.length) {
          offspring.push(selected[i + 1]);
        }
      }
    }
    
    // Mutation
    for (let i = 0; i < offspring.length; i++) {
      if (Math.random() < baseMutationRate) {
        offspring[i] = this.mutate(offspring[i], problem, baseMutationRate, gen);
      }
    }
    
    // Create new population with elitism
    population = [...elites, ...offspring.slice(0, populationSize - eliteCount)];
    
    // Log progress
    if (gen % 10 === 0 || gen === generations - 1) {
      console.log(`Generation ${gen + 1}/${generations}: Best fitness = ${bestFitness}, Avg fitness = ${avgFitness.toFixed(2)}`);
      console.log(`Hard violations: ${avgHardViolations.toFixed(2)}, Soft violations: ${avgSoftViolations.toFixed(2)}`);
    }
  }
  
  // Evaluate final solution
  const finalEvaluation = await this.evaluateSchedule(
    bestChromosome.genes.map(gene => ({
      ...gene.event,
      roomId: gene.room.id,
      staffId: gene.staff.id,
      start: gene.timeSlot.start,
      end: gene.timeSlot.end
    })),
    problem
  );
  
  return {
    bestChromosome,
    metrics: {
      ...finalEvaluation,
      optimizationProgress: metrics
    }
  };
}
}

module.exports = SchedulerOptimizer;