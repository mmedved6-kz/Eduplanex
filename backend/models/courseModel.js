const db = require('../config/db');

// Fetch all courses
const getAllCourses = async () => {
    return db.any('SELECT * FROM courses');
};

// Add a new course
const addCourse = async (course_name) => {
    return db.one(
        'INSERT INTO courses (course_name) VALUES ($1) RETURNING *',
        [course_name]
    );
};

module.exports = { getAllCourses, addCourse };
