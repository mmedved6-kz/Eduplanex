const db = require('../config/db');

const Module = {
    // Get all modules with pagination, search, sorting and filtering
    getAll: async (limit, offset, searchQuery, sortColumn, sortOrder, filters) => {
        const validColumns = ['module.name', 'course.name', 'module.semester'];
        const defaultSort = 'module.name';
    
        const actualSortColumn = validColumns.includes(sortColumn) ? sortColumn : defaultSort;
        const actualSortOrder = ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : 'ASC';
        
        const params = [`%${searchQuery}%`, limit, offset];

        let query = `
            SELECT 
                module.*,
                course.name AS coursename
            FROM Module module
            LEFT JOIN Course course ON module.courseId = course.id
            WHERE (module.name ILIKE $1 OR module.description ILIKE $1)
        `;

        if (filters.courseId) {
            const courseId = filters.courseId;
            if (courseId) {
                params.push(courseId);
                query += ` AND module.courseId = $${params.length}`;
            }
        }
          
        query += ` ORDER BY ${actualSortColumn} ${actualSortOrder}
                LIMIT $2 OFFSET $3`;

        return await db.any(query, params);
    },

    // Get a module by ID
    getById: async (id) => {
        return await db.oneOrNone(`
            SELECT 
                module.*,
                course.name AS coursename
            FROM Module module
            LEFT JOIN Course course ON module.courseId = course.id
            WHERE module.id = $1
        `, [id]);
    },

    // Create a new module
    create: async (module) => {
        const { id, name, description, courseId, semester } = module;
        return await db.one(
            `INSERT INTO Module
             (id, name, description, courseId)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [id, name, description, courseId, semester]
        );
    },

    // Update a module
    update: async (id, updates) => {
        const { name, description, courseId, semester } = updates;
        return await db.one(
            `UPDATE Module SET
             name = $1,
             description = $2,
             courseId = $3
             WHERE id = $4
             RETURNING *`,
            [name, description, courseId, semester, id]
        );
    },

    // Delete a module
    delete: async (id) => {
        return await db.none('DELETE FROM Module WHERE id = $1', [id]);
    },

    // Count total modules with filters
    count: async (searchQuery, filters) => {
        const params = [`%${searchQuery}%`];
        
        let query = `
            SELECT COUNT(*) 
            FROM Module module
            LEFT JOIN Course course ON module.courseId = course.id
            WHERE (module.name ILIKE $1 OR module.description ILIKE $1)
        `;

        if (filters.courseId) {
            const courseId = filters.courseId;
            if (courseId) {
                params.push(courseId);
                query += ` AND module.courseId = $${params.length}`;
            }
        }

        return await db.one(query, params);
    },
};

module.exports = Module;