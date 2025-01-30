const express = require('express');
const staffController = require('../controllers/staffController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const validationRequest = require('../middleware/validationMiddleware');
const staffSchema = require('../validationSchemas/studentSchema');

router.use(authMiddleware);

// GET /api/staff
router.get('/', staffController.getAllStaff);

// GET /api/staff/:id
router.get('/:id', staffController.getStaffById);

// POST /api/staff
router.post('/', validationRequest(staffSchema), staffController.createStaff);

// PUT /api/staff/:id
router.put('/:id', validationRequest(staffSchema), staffController.updateStaff);

// DELETE /api/staff/:id
router.delete('/:id', staffController.deleteStaff);

module.exports = router;