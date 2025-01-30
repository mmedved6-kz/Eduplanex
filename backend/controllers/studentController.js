const Student = require('../models/studentModel');
const StudentDTO = require('../dto/studentDTO');

// Get all students
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.getAll();
        const studentDTOs = students.map(student => new StudentDTO(student));
        res.json(studentDTOs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a student by ID
const getStudentById = async (req, res) => {
    try {
        const student = await Student.getById(req.params.id);
        if (student) {
            const studentDTO = new StudentDTO(student);
            res.json(studentDTO);
        } else {
            res.status(404).json({ error: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new student
const createStudent = async (req, res) => {
    try {
        const newStudent = await Student.create(req.body);
        const studentDTO = new StudentDTO(newStudent);
        res.status(201).json(studentDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a student
const updateStudent = async (req, res) => {
    try {
        const updatedStudent = await Student.update(req.params.id, req.body);
        const studentDTO = new StudentDTO(updatedStudent);
        res.json(studentDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a student
const deleteStudent = async (req, res) => {
    try {
        await Student.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
};