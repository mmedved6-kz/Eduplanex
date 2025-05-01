const db = require('../config/db');

const Event = {
    // Get all events with pagination, search, and sorting
    getAll: async (limit, offset, searchQuery, sortColumn, sortOrder, filters = {}) => {
      const validColumns = ['event.title', 'module.name', 'event.start_time', 'event.tag', 'event.event_date'];
      const defaultSort = 'event.event_date';
    
      const actualSortColumn = validColumns.includes(sortColumn) ? sortColumn : defaultSort;
      const actualSortOrder = ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : 'ASC';
      
      const params = [`%${searchQuery}%`, limit, offset];
    
      let query = `
        SELECT 
          event.*,
          ts.start_time as timeslot_start,
          ts.end_time as timeslot_end,
          ts.duration_minutes,
          m.name AS modulename,
          c.name AS coursename,
          r.name AS roomname,
          s.name AS staffname
        FROM Event event
        LEFT JOIN timeslot ts ON event.timeslot_id = ts.id
        LEFT JOIN Module m ON event.moduleId = m.id
        LEFT JOIN Room r ON event.roomId = r.id
        LEFT JOIN Staff s ON event.staffId = s.id
        LEFT JOIN Course c ON event.courseId = c.id
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
                event.*,
                ts.start_time as timeslot_start,
                ts.end_time as timeslot_end,
                ts.duration_minutes,
                m.name AS modulename,
                r.name AS roomname,
                s.name AS staffname,
                c.name AS coursename
            FROM Event event
            LEFT JOIN Module m ON event.moduleId = m.id
            LEFT JOIN Room r ON event.roomId = r.id
            LEFT JOIN Staff s ON event.staffId = s.id
            LEFT JOIN Course c ON event.courseId = c.id
            WHERE event.id = $1
        `, [id]);
    },

    create: async (event) => {
      const { 
        id, title, description, event_date, timeslot_id, 
        start_time, end_time, moduleId, roomId, staffId, 
        student_count, tag, courseId, students 
      } = event;
      
      return await db.tx(async t => {
        // Create event
        const newEvent = await t.one(
          `INSERT INTO Event 
           (id, title, description, event_date, timeslot_id, start_time, end_time, 
            tag, moduleId, roomId, staffId, student_count, courseId) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
           RETURNING *`,
          [id, title, description, event_date, timeslot_id, 
            start_time, end_time, tag, moduleId, roomId, staffId, 
            student_count, courseId]
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
        title, description, event_date, timeslot_id, 
        start_time, end_time, moduleId, roomId, staffId, 
        student_count, tag, courseId, students 
      } = updates;

      return await db.tx(async t => {
        // Update the event
        const updatedEvent = await t.one(
          `UPDATE Event SET 
              title = $1,
              description = $2,
              event_date = $3,
              timeslot_id = $4,
              start_time = $5,
              end_time = $6,
              moduleId = $7,
              roomId = $8,
              staffId = $9,
              student_count = $10,
              tag = $11,
              courseId = $12
           WHERE id = $13
           RETURNING *`,
          [title, description, event_date, timeslot_id, 
            start_time, end_time, moduleId, roomId, staffId, 
            student_count, tag, courseId, id]
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
          
          await t.none('DELETE FROM event_students WHERE eventId = $1', [id]);
          
          return await t.none('DELETE FROM Event WHERE id = $1', [id]);
      });
  },

  getCalendarEvents: async () => {
    try {
      const events = await db.any(`
        SELECT
            e.id,
            e.title,
            e.event_date,
            e.tag,
            e.roomid,     
            e.staffid,     
            e.moduleid,    
            e.courseid,    
            e.timeslot_id, 
            ts.start_time as timeslot_start,
            ts.end_time as timeslot_end,
            m.name AS modulename,
            c.name AS coursename,
            r.name AS roomname,
            s.name AS staffname
        FROM Event e
        LEFT JOIN timeslot ts ON e.timeslot_id = ts.id
        LEFT JOIN Module m ON e.moduleId = m.id
        LEFT JOIN Room r ON e.roomId = r.id
        LEFT JOIN Staff s ON e.staffId = s.id
        LEFT JOIN Course c ON e.courseId = c.id
        ORDER BY e.event_date, ts.start_time;
    `);
      
      // Convert to standard format
      return events.map(event => ({
        id: event.id,
        title: event.title,
        eventDate: event.event_date,
        startTime: event.timeslot_start,
        endTime: event.timeslot_end,
        description: event.description,
        tag: event.tag,
        moduleName: event.modulename,
        roomName: event.roomname,
        staffName: event.staffname,
        courseName: event.coursename
      }));
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }
  
};

module.exports = Event;