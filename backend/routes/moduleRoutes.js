const express = require('express');
const router = express.Router();
const { getModules, createModule } = require('../controllers/moduleController');

router.get('/', getModules);
router.post('/', createModule);

module.exports = router;
