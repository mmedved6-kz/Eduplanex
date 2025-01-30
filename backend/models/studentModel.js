const db = require('../config/db');

const Student = {
    // Get all students
    getAll: async () => {
        return await db.any('SELECT * FROM Student');
    },

    // Get a student by ID
    getById: async (id) => {
        return await db.oneOrNone('SELECT * FROM Student WHERE id = $1', [id]);
    },

    // Create a new student
    create: async (student) => {
        const { username, name, surname, email, phone, address, img, sex, classId, courseId, moduleId, birthday } = student;
        return await db.one(
            'INSERT INTO Student (username, name, surname, email, phone, address, img, sex, classId, courseId, moduleId, birthday) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
            [username, name, surname, email, phone, address, img, sex, classId, courseId, moduleId, birthday]
        );
    },

    // Update a student
    update: async (id, updates) => {
        const { name, email } = updates;
        return await db.one(
            'UPDATE Student SET name = $1, email = $2 WHERE id = $3 RETURNING *',
            [name, email, id]
        );
    },

    // Delete a student
    delete: async (id) => {
        return await db.none('DELETE FROM Student WHERE id = $1', [id]);
    },
};

module.exports = Student;