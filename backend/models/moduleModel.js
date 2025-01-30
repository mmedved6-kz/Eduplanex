const db = require('../config/db');

const Module = {
    // Get all modules
    getAll: async () => {
        return await db.any('SELECT * FROM Module');
    },

    // Get a module by ID
    getById: async (id) => {
        return await db.oneOrNone('SELECT * FROM Module WHERE id = $1', [id]);
    },

    // Create a new module
    create: async (module) => {
        const { name, courseId } = module;
        return await db.one(
            'INSERT INTO Module (name, courseId) VALUES ($1, $2) RETURNING *',
            [name, courseId]
        );
    },

    // Update a module
    update: async (id, updates) => {
        const { name } = updates;
        return await db.one(
            'UPDATE Module SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
    },

    // Delete a module
    delete: async (id) => {
        return await db.none('DELETE FROM Module WHERE id = $1', [id]);
    },
};

module.exports = Module;