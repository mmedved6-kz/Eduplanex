const express = require('express');
const moduleController = require('../controllers/moduleController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/modules
router.get('/', moduleController.getAllModules);

// GET /api/modules/:id
router.get('/:id', moduleController.getModuleById);

// POST /api/modules
router.post('/', moduleController.createModule);

// PUT /api/modules/:id
router.put('/:id', moduleController.updateModule);

// DELETE /api/modules/:id
router.delete('/:id', moduleController.deleteModule);

module.exports = router;