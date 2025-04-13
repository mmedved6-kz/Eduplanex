const db = require('../config/db');

const TimeSlot = {
  // Get all time slots
  getAll: async () => {
    return await db.any('SELECT * FROM timeslot ORDER BY start_time');
  },

  // Get a time slot by ID
  getById: async (id) => {
    return await db.oneOrNone('SELECT * FROM timeslot WHERE id = $1', [id]);
  },

  // Create a new time slot (admin function)
  create: async (timeSlot) => {
    const { id, start_time, end_time, duration_minutes } = timeSlot;
    return await db.one(
      'INSERT INTO timeslot (id, start_time, end_time, duration_minutes) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, start_time, end_time, duration_minutes]
    );
  },

  // Update a time slot (admin function)
  update: async (id, updates) => {
    const { start_time, end_time, duration_minutes } = updates;
    return await db.one(
      'UPDATE timeslot SET start_time = $1, end_time = $2, duration_minutes = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [start_time, end_time, duration_minutes, id]
    );
  },

  // Calculate time slots that are available for a given date and constraints
  findAvailable: async (date, roomId = null, staffId = null, minCapacity = 0) => {
    // Build the query based on what constraints are provided
    let query = `
      WITH busy_slots AS (
        SELECT ts.id
        FROM timeslot ts
        JOIN event event ON event.timeslot_id = ts.id
        WHERE event.event_date = $1
    `;
    
    const params = [date];
    let paramIndex = 2;
    
    if (roomId) {
      query += ` AND event.roomid = $${paramIndex}`;
      params.push(roomId);
      paramIndex++;
    }
    
    if (staffId) {
      query += ` AND event.staffid = $${paramIndex}`;
      params.push(staffId);
      paramIndex++;
    }
    
    query += `
      )
      SELECT ts.*
      FROM timeslot ts
      WHERE ts.id NOT IN (SELECT id FROM busy_slots)
    `;
    
    // If minCapacity is specified, find rooms that satisfy it and check availability
    if (minCapacity > 0) {
      query += `
        AND EXISTS (
          SELECT 1 FROM room r
          WHERE r.capacity >= $${paramIndex}
          AND NOT EXISTS (
            SELECT 1 FROM event e
            WHERE event.event_date = $1
            AND event.timeslot_id = ts.id
            AND event.roomid = r.id
          )
        )
      `;
      params.push(minCapacity);
    }
    
    query += ` ORDER BY ts.start_time`;
    
    return await db.any(query, params);
  }
};

module.exports = TimeSlot;