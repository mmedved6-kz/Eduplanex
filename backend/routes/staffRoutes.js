const express = require('express');
const router = express.Router();
const { getStaff, createStaff } = require('../controllers/staffController');

router.get('/', getStaff);
router.post('/', createStaff);

module.exports = router;
