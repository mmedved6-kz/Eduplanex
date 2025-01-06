// backend/models/studentModel.js
const db = require('../config/db');

// Fetch all students
const getAllStudents = async () => {
    try {
        return db.any('SELECT * FROM students');
    } catch (error) {
        console.error('Error in Model:', error.message); 
        throw error;
    }
};


// Add a new student
const addStudent = async (first_name, last_name, email, year_of_study) => {
    return db.one(
        'INSERT INTO students (first_name, last_name, email, year_of_study) VALUES ($1, $2, $3, $4) RETURNING *',
        [first_name, last_name, email, year_of_study]
    );
};

module.exports = { getAllStudents, addStudent };
