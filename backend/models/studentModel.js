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

    getByUserId: async (userId) => {
      return await db.oneOrNone('SELECT * FROM Student WHERE user_id = $1', [userId]);
    },

    // Create a new student
    create: async (student) => {
        const { id, username, email, name, surname, phone, year, courseId, sex, img} = student;
        return await db.tx(async t => {
          const newStudent = await t.one(
            `INSERT INTO Student
             (id, username, email, name, surname, phone, year, course_id, sex, img, enrollment_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, DEFAULT)
             RETURNING *`,
            [id, username, email, name, surname, phone, year, courseId, sex, img]
        );
            return newStudent;
        });
    },

    // Update a student
    update: async (id, updates) => {
        const { username, name, surname, email, phone, img, sex, enrollment_date } = updates;
        return await db.tx(async t => {
          const updatedStudent = await t.one(
            `UPDATE Student
             SET username = $1,
              name = $2,
              surname = $3,
              email = $4,
              phone = $5
              img = $6,
              sex = $7,
              WHERE id = $9 
              RETURNING *`,
            [username, name, surname, email, phone, img, sex, enrollment_date, id]
          );
            return updatedStudent;
      });
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