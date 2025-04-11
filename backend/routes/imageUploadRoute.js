const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/imageUpload');

// Image upload route
router.post('/', uploadImage);

module.exports = router;