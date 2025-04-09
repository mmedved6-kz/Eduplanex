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
          course.name AS coursename,
          room.name AS roomname,
          staff.name AS staffname
        FROM Event event
        LEFT JOIN Module module ON event.moduleId = module.id
        LEFT JOIN Room room ON event.roomId = room.id
        LEFT JOIN Staff staff ON event.staffId = staff.id
        LEFT JOIN Course course ON event.courseId = course.id
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
                c.name AS coursename
            FROM Event e
            LEFT JOIN Module m ON e.moduleId = m.id
            LEFT JOIN Room r ON e.roomId = r.id
            LEFT JOIN Staff s ON e.staffId = s.id
            LEFT JOIN Course c ON e.courseId = c.id
            WHERE e.id = $1
        `, [id]);
    },

    create: async (event) => {
      const { 
        id, title, description, start_time, end_time, 
        moduleId, roomId, staffId, student_count, tag, courseId, students 
      } = event;
      
      return await db.tx(async t => {
        // Create event
        const newEvent = await t.one(
          `INSERT INTO Event 
           (id, title, description, start_time, end_time, tag, moduleId, roomId, staffId, student_count, courseId) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
           RETURNING *`,
          [id, title, description, start_time, end_time, tag, moduleId, roomId, staffId, student_count, courseId]
        );
        
        // If we have students, create relationships
        if (students && students.length > 0) {
          console.log(`Creating ${students.length} student relationships for event ${id}`);
          
          // Use multi-row insert
          const values = students.map(studentId => `('${id}', '${studentId}')`).join(', ');
          await t.none(`
            INSERT INTO event_students (eventId, studentId) 
            VALUES ${values}
          `);
        }
        
        return newEvent;
      });
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
          LEFT JOIN Course course ON event.courseId = course.id
          WHERE event.title ILIKE $1
        `;
      
        if (filters.staffId) {
          const staffId = filters.staffId;
          if (staffId) {
            params.push(staffId);
            query += ` AND event.staffId = $${params.length}`;
          }
        }
      
        return await db.one(query, params);
      },

    // Update an event
    update: async (id, updates) => {
      const { 
        title, description, start_time, end_time, 
        moduleId, roomId, staffId, student_count, tag, courseId, students 
      } = updates;
      
      return await db.tx(async t => {
        // Update the event
        const updatedEvent = await t.one(
          `UPDATE Event SET 
              title = $1,
              description = $2,
              start_time = $3,
              end_time = $4,
              moduleId = $5,
              roomId = $6,
              staffId = $7,
              student_count = $8,
              tag = $9,
              courseId = $10
           WHERE id = $11
           RETURNING *`,
          [title, description, start_time, end_time, moduleId, roomId, staffId, student_count, tag, courseId, id]
        );
        
        // Update student relationships - first remove all existing
        await t.none('DELETE FROM event_students WHERE eventId = $1', [id]);
        
        // Then add the new ones if any
        if (students && students.length > 0) {
          console.log(`Creating ${students.length} student relationships for event ${id}`);
          
          // Use multi-row insert
          const values = students.map(studentId => `('${id}', '${studentId}')`).join(', ');
          await t.none(`
            INSERT INTO event_students (eventId, studentId) 
            VALUES ${values}
          `);
        }
        
        return updatedEvent;
      });
    },

    // Delete an event
    delete: async (id) => {
      return await db.tx(async t => {
          console.log(`Deleting event ${id} and its related records`);
          
          // First, delete any student associations
          await t.none('DELETE FROM event_students WHERE eventId = $1', [id]);
          
          // Then delete the event itself
          return await t.none('DELETE FROM Event WHERE id = $1', [id]);
      });
  },
};

module.exports = Event;