const db = require('../config/db');

const Event = {
    // Get all events
    getAll: async (limit, offset, search, sortColumn, sortOrder, filters) => {
      const query = `
        SELECT 
          event.*,
          module.name AS modulename,
          room.name AS roomname,
          staff.name AS staffname
        FROM Event event
        LEFT JOIN Module module ON event.moduleId = module.id
        LEFT JOIN Room room ON event.roomId = room.id
        LEFT JOIN Staff staff ON event.staffId = staff.id
        WHERE event.title ILIKE $1
        ORDER BY ${sortColumn} ${sortOrder}
        LIMIT $2 OFFSET $3
      `;
      return await db.any(query, [`%${search}%`, limit, offset]);
  },

    // Get an event by ID
    getById: async (id) => {
        return await db.oneOrNone(`
            SELECT 
                e.*,
                m.name AS modulename,
                r.name AS roomname,
                s.name AS staffname,
                r.capacity AS maxcapacity
            FROM Event e
            LEFT JOIN Module m ON e.moduleId = m.id
            LEFT JOIN Room r ON e.roomId = r.id
            LEFT JOIN Staff s ON e.staffId = s.id
            WHERE e.id = $1
        `, [id]);
    },

    // Create a new event
    create: async (event) => {
        const { title, start, end, moduleId, roomId, staffId, studentCount } = event;
        return await db.one(
          `INSERT INTO Event 
           (title, startTime, endTime, moduleId, roomId, staffId, studentCount) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           RETURNING *`,
          [title, start, end, moduleId, roomId, staffId, studentCount]
        );
      },

      // Add this to your existing Event model object
count: async (searchQuery, filters = {}) => {
  const params = [`%${searchQuery}%`];
  
  let query = `
    SELECT COUNT(*) 
    FROM Event event
    LEFT JOIN Module module ON event.moduleId = module.id
    LEFT JOIN Room room ON event.roomId = room.id
    LEFT JOIN Staff staff ON event.staffId = staff.id
    WHERE event.title ILIKE $1
  `;

  // Add filter conditions
  let paramIndex = 2;
  
  if (filters.moduleId) {
    query += ` AND event.moduleId = $${paramIndex}`;
    params.push(filters.moduleId);
    paramIndex++;
  }
  
  if (filters.staffId) {
    query += ` AND event.staffId = $${paramIndex}`;
    params.push(filters.staffId);
    paramIndex++;
  }
  
  if (filters.roomId) {
    query += ` AND event.roomId = $${paramIndex}`;
    params.push(filters.roomId);
    paramIndex++;
  }
  
  if (filters.tag) {
    query += ` AND event.tag = $${paramIndex}`;
    params.push(filters.tag);
    paramIndex++;
  }
  
  if (filters.startDate) {
    query += ` AND event.start_time >= $${paramIndex}`;
    params.push(filters.startDate);
    paramIndex++;
  }
  
  if (filters.endDate) {
    query += ` AND event.end_time <= $${paramIndex}`;
    params.push(filters.endDate);
    paramIndex++;
  }

  return await db.one(query, params);
},

    // Update an event
    update: async (id, updates) => {
        const { title, start, end, moduleId, roomId, staffId, studentCount } = updates;
        return await db.one(
            `UPDATE Event SET 
                title = $1,
                startTime = $2,
                endTime = $3,
                moduleId = $4,
                roomId = $5,
                staffId = $6,
                studentCount = $7
             WHERE id = $8
             RETURNING *`,
            [title, start, end, moduleId, roomId, staffId, studentCount, id]
        );
    },

    // Delete an event
    delete: async (id) => {
        return await db.none('DELETE FROM Event WHERE id = $1', [id]);
    },
};

module.exports = Event;