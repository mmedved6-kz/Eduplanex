const db = require('../config/db');

const Course = {
    // Get all courses
    getAll: async () => {
        return await db.any('SELECT * FROM Course');
    },

    // Get a course by ID
    getById: async (id) => {
        return await db.oneOrNone('SELECT * FROM Course WHERE id = $1', [id]);
    },

    // Create a new course
    create: async (course) => {
        const { name, departmentId } = course;
        return await db.one(
            'INSERT INTO Course (name, departmentId) VALUES ($1, $2) RETURNING *',
            [name, departmentId]
        );
    },

    // Update a course
    update: async (id, updates) => {
        const { name } = updates;
        return await db.one(
            'UPDATE Course SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
    },

    // Delete a course
    delete: async (id) => {
        return await db.none('DELETE FROM Course WHERE id = $1', [id]);
    },
};

module.exports = Course;