const express = require('express');
const courseController = require('../controllers/courseController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/courses
router.get('/', courseController.getAllCourses);

// GET /api/courses/:id
router.get('/:id', courseController.getCourseById);

// POST /api/courses
router.post('/', courseController.createCourse);

// PUT /api/courses/:id
router.put('/:id', courseController.updateCourse);

// DELETE /api/courses/:id
router.delete('/:id', courseController.deleteCourse);

module.exports = router;