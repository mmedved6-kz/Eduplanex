// backend/controllers/studentController.js
const studentModel = require('../models/studentModel');

// Get all students
const getStudents = async (req, res) => {
    try {
        const students = await studentModel.getAllStudents();
        res.json(students);
    } catch (error) {
        console.error('Database Error:', error.message);  // Added for better debugging
        res.status(500).send(`Error fetching students: ${error.message}`);
    }
};


// Add a student
const createStudent = async (req, res) => {
    const { first_name, last_name, email, year_of_study } = req.body;
    try {
        const newStudent = await studentModel.addStudent(first_name, last_name, email, year_of_study);
        res.status(201).json(newStudent);
    } catch (error) {
        res.status(500).send('Error adding student');
    }
};

module.exports = { getStudents, createStudent };
