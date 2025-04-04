const db = require('../config/db');

const Student = {
    // Get all students
    getAll: async (limit, offset, searchQuery, sortColumn, sortOrder, filters) => {
        const validColumns = ['student.name', 'student.email', 'course.name', 'student.phone', 'student.surname'];
        const defaultSort = 'student.name';
    
        const actualSortColumn = validColumns.includes(sortColumn) ? sortColumn : defaultSort;
        const actualSortOrder = ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : 'ASC';
        
        const params = [`%${searchQuery}%`, limit, offset];

        let query = `
            SELECT *
            FROM Student
            WHERE (name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)
        `;

        if (filters.courseId) {
            const courseId = parseInt(filters.courseId);
            if (!isNaN(courseId)) {
              params.push(courseId);
              query += ` AND course.id = $${params.length}`;
            }
          }
      
          if (filters.sex) {
            // Validate sex value against allowed enum values
            const validSexValues = ['MALE', 'FEMALE'];
            if (validSexValues.includes(filters.sex.toUpperCase())) {
              params.push(filters.sex.toUpperCase());
              query += ` AND s.sex = $${params.length}`;
            }
          }
          
        query += ` ORDER BY ${actualSortColumn} ${actualSortOrder}
                LIMIT $2 OFFSET $3`;

        return await db.any(query, params);    },

    // Get a student by ID
    getById: async (id) => {
        return await db.oneOrNone(`
            SELECT *
            FROM Student
            WHERE id = $1
            `, [id]);
    },

    // Create a new student
    create: async (student) => {
        const { username, name, surname, email, phone, address, img, sex, classId, courseId, moduleId, birthday } = student;
        return await db.one(
            `INSERT INTO Student 
             (username, name, surname, email, phone, address, img, sex, birthday) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING *`,
            [username, name, surname, email, phone, address, img, sex, classId, courseId, moduleId, birthday]
        );
    },

    // Update a student
    update: async (id, updates) => {
        const { name, email } = updates;
        return await db.one(
            'UPDATE Student SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *',
            [name, email, id]
        );
    },

    // Delete a student
    delete: async (id) => {
        return await db.none('DELETE FROM Student WHERE id = $1', [id]);
    },

    // Count total students with filters
    count: async (searchQuery, filters) => {
    const params = [`%${searchQuery}%`];
    
    let query = `
      SELECT COUNT(*) 
            FROM Student
            WHERE (name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)
    `;

    if (filters.sex) {
      params.push(filters.sex);
      query += ` AND student.sex = $${params.length}`;
    }

    return await db.one(query, params);
  },
};

module.exports = Student;