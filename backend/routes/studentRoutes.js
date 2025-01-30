const express = require('express');
const studentController = require('../controllers/studentController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const validationRequest = require('../middleware/validationMiddleware');
const studentSchema = require('../validationSchemas/studentSchema');

router.use(authMiddleware);

// GET /api/students
router.get('/', studentController.getAllStudents);

// GET /api/students/:id
router.get('/:id', studentController.getStudentById);

// POST /api/students
router.post('/', validationRequest(studentSchema), studentController.createStudent);

// PUT /api/students/:id
router.put('/:id', validationRequest(studentSchema), studentController.updateStudent);

// DELETE /api/students/:id
router.delete('/:id', studentController.deleteStudent);

module.exports = router;