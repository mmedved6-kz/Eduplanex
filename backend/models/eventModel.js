const db = require('../config/db');

const Event = {
    // Get all events
    getAll: async (limit, offset, searchQuery, sortColumn, sortOrder, filters = {}) => {
      const validColumns = ['event.title', 'module.name', 'event.start_time', 'event.tag'];
      const defaultSort = 'event.start_time';
    
      const actualSortColumn = validColumns.includes(sortColumn) ? sortColumn : defaultSort;
      const actualSortOrder = ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : 'ASC';
      
      const params = [`%${searchQuery}%`, limit, offset];
    
      let query = `
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
      `;
    
      if (filters.staffId) {
        params.push(filters.staffId);
        query += ` AND event.staffId = $${params.length}`;
      }
      
      query += ` ORDER BY ${actualSortColumn} ${actualSortOrder}
        LIMIT $2 OFFSET $3`;
    
      return await db.any(query, params);
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
      
        if (filters.staffId) {
          const staffId = filters.staffId;
          if (staffId) {
            params.push(staffId);
            query += ` AND event.staffId = $${params.length}`; // Changed from staff.id to event.staffId
          }
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