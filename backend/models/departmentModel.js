const db = require('../config/db');

const Department = {
    // Get all departments
    getAll: async () => {
        return await db.any('SELECT * FROM Department');
    },

    // Get a Department by ID
    getById: async (id) => {
        return await db.oneOrNone('SELECT * FROM Department WHERE id = $1', [id]);
    },

    // Create a new department
    create: async (department) => {
        const { name } = department; // Remove departmentId
        return await db.one(
            'INSERT INTO Department (name) VALUES ($1) RETURNING *',
            [name]
        );
    },

    // Update a department
    update: async (id, updates) => {
        const { name } = updates;
        return await db.one(
            'UPDATE Department SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
    },

    // Delete a department
    delete: async (id) => {
        return await db.none('DELETE FROM Department WHERE id = $1', [id]); 
    },
};

module.exports = Department;