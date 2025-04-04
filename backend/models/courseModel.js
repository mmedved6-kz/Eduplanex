const db = require('../config/db');

const Course = {
    // Get all courses with pagination, search, sorting and filtering
    getAll: async (limit, offset, searchQuery, sortColumn, sortOrder, filters) => {
        const validColumns = ['course.name', 'department.name', 'course.credit_hours'];
        const defaultSort = 'course.name';
    
        const actualSortColumn = validColumns.includes(sortColumn) ? sortColumn : defaultSort;
        const actualSortOrder = ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : 'ASC';
        
        const params = [`%${searchQuery}%`, limit, offset];

        let query = `
            SELECT 
                course.*,
                department.name AS departmentname
            FROM Course course
            LEFT JOIN Department department ON course.departmentId = department.id
            WHERE (course.name ILIKE $1 OR course.description ILIKE $1)
        `;

        if (filters.departmentId) {
            const departmentId = filters.departmentId;
            if (departmentId) {
                params.push(departmentId);
                query += ` AND course.departmentId = $${params.length}`;
            }
        }
          
        query += ` ORDER BY ${actualSortColumn} ${actualSortOrder}
                LIMIT $2 OFFSET $3`;

        return await db.any(query, params);
    },

    // Get a course by ID
    getById: async (id) => {
        return await db.oneOrNone(`
            SELECT 
                course.*,
                department.name AS departmentname
            FROM Course course
            LEFT JOIN Department department ON course.departmentId = department.id
            WHERE course.id = $1
        `, [id]);
    },

    // Create a new course
    create: async (course) => {
        const { name, description, credit_hours, departmentId } = course;
        return await db.one(
            `INSERT INTO Course 
             (name, description, credit_hours, departmentId) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [name, description, credit_hours, departmentId]
        );
    },

    // Update a course
    update: async (id, updates) => {
        const { name, description, credit_hours, departmentId } = updates;
        return await db.one(
            `UPDATE Course SET 
             name = $1, 
             description = $2, 
             credit_hours = $3, 
             departmentId = $4 
             WHERE id = $5 
             RETURNING *`,
            [name, description, credit_hours, departmentId, id]
        );
    },

    // Delete a course
    delete: async (id) => {
        return await db.none('DELETE FROM Course WHERE id = $1', [id]);
    },

    // Count total courses with filters
    count: async (searchQuery, filters) => {
        const params = [`%${searchQuery}%`];
        
        let query = `
            SELECT COUNT(*) 
            FROM Course course
            LEFT JOIN Department department ON course.departmentId = department.id
            WHERE (course.name ILIKE $1 OR course.description ILIKE $1)
        `;

        if (filters.departmentId) {
            const departmentId = filters.departmentId;
            if (departmentId) {
                params.push(departmentId);
                query += ` AND course.departmentId = $${params.length}`;
            }
        }

        return await db.one(query, params);
    },
};

module.exports = Course;