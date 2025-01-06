const courseModel = require('../models/courseModel');

const getCourses = async (req, res) => {
    try {
        const courses = await courseModel.getAllCourses();
        res.json(courses);
    } catch (error) {
        res.status(500).send('Error fetching courses');
    }
};

const createCourse = async (req, res) => {
    const { course_name } = req.body;
    try {
        const newCourse = await courseModel.addCourse(course_name);
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).send('Error adding course');
    }
};

module.exports = { getCourses, createCourse };
