const db = require('../config/db');

const Event = {
    // Get all events
    getAll: async () => {
        return await db.any('SELECT * FROM Event');
    },

    // Get an event by ID
    getById: async (id) => {
        return await db.oneOrNone('SELECT * FROM Event WHERE id = $1', [id]);
    },

    // Create a new event
    create: async (event) => {
        const { title, startTime, endTime, classId } = event;
        return await db.one(
            'INSERT INTO Event (title, startTime, endTime, classId) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, startTime, endTime, classId]
        );
    },

    // Update an event
    update: async (id, updates) => {
        const { title, startTime, endTime, classId } = updates;
        return await db.one(
            'UPDATE Event SET title = $1, startTime = $2, endTime = $3, classId = $4 WHERE id = $5 RETURNING *',
            [title, startTime, endTime, classId, id]
        );
    },

    // Delete an event
    delete: async (id) => {
        return await db.none('DELETE FROM Event WHERE id = $1', [id]);
    },
};

module.exports = Event;