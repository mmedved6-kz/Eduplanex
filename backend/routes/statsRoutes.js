const express = require('express');
const statsController = require('../controllers/statsController');
const router = express.Router();

router.get('/dashboard', statsController.getDashboardStats);

module.exports = router;