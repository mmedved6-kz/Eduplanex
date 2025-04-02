const express = require('express');
const departmentController = require('../controllers/departmentController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

//router.use(authMiddleware);

// GET /api/departments
router.get('/', departmentController.getAllDepartments);

// GET /api/departments/:id
router.get('/:id', departmentController.getDepartmentById);

// POST /api/departments
router.post('/', departmentController.createDepartment);

// PUT /api/departments/:id
router.put('/:id', departmentController.updateDepartment);

// DELETE /api/departments/:id
router.delete('/:id', departmentController.deleteDepartment);

module.exports = router;