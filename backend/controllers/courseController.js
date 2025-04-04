const Course = require('../models/courseModel');
const CourseDTO = require('../dto/courseDTO');

// Get all courses
const getAllCourses = async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 10,
            search = '', 
            sortColumn = 'course.name', 
            sortOrder = 'ASC',
        } = req.query;

        const filters = {

          };
      
        const limit = parseInt(pageSize);
        const offset = (parseInt(page) - 1) * limit;
        
        const courses = await Course.getAll( limit, offset, search, sortColumn, sortOrder, filters);
        const totalCourses = await Course.count(search, filters);
        const totalPages = Math.ceil(totalCourses.count / limit);
        
        const courseDTOs = courses.map(course => new CourseDTO(course));
        res.json({
            items: courseDTOs,
            currentPage: parseInt(page),
            totalPages,
            totalItems: totalCourses.count,
            pageSize: limit,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a course by ID
const getCourseById = async (req, res) => {
    try {
        const course = await Course.getById(req.params.id);
        if (course) {
            const courseDTO = new CourseDTO(course);
            res.json(courseDTO);
        } else {
            res.status(404).json({ error: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new course
const createCourse = async (req, res) => {
    try {
        const newCourse = await Course.create(req.body);
        const courseDTO = new CourseDTO(newCourse);
        res.status(201).json(courseDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a course
const updateCourse = async (req, res) => {
    try {
        const updatedCourse = await Course.update(req.params.id, req.body);
        const courseDTO = new CourseDTO(updatedCourse);
        res.json(courseDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a course
const deleteCourse = async (req, res) => {
    try {
        await Course.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
};