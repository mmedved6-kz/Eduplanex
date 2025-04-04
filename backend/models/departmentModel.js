const db = require('../config/db');

const Department = {
    // Get all departments with pagination, search, and sorting
    getAll: async (limit, offset, searchQuery, sortColumn, sortOrder) => {
        const validColumns = ['department.name', 'department.created_at', 'department.updated_at'];
        const defaultSort = 'department.name';
    
        const actualSortColumn = validColumns.includes(sortColumn) ? sortColumn : defaultSort;
        const actualSortOrder = ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : 'ASC';
        
        const query = `
            SELECT *
            FROM Department
            WHERE name ILIKE $1
            ORDER BY ${actualSortColumn} ${actualSortOrder}
            LIMIT $2 OFFSET $3
        `;
        
        return await db.any(query, [`%${searchQuery}%`, limit, offset]);
    },

    // Get a department by ID
    getById: async (id) => {
        return await db.oneOrNone('SELECT * FROM Department WHERE id = $1', [id]);
    },

    // Create a new department
    create: async (department) => {
        const { name } = department;
        return await db.one(
            'INSERT INTO Department (name) VALUES ($1) RETURNING *',
            [name]
        );
    },

    // Update a department
    update: async (id, updates) => {
        const { name } = updates;
        return await db.one(
            'UPDATE Department SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [name, id]
        );
    },

    // Delete a department
    delete: async (id) => {
        return await db.none('DELETE FROM Department WHERE id = $1', [id]);
    },

    // Count total departments
    count: async (searchQuery) => {
        return await db.one(
            'SELECT COUNT(*) FROM Department WHERE name ILIKE $1',
            [`%${searchQuery}%`]
        );
    },
};

module.exports = Department;