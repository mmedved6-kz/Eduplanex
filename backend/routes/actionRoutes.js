const express = require('express');
const actionItemController = require('../controllers/actionItemController');
const router = express.Router();

router.get('/', actionItemController.getAllActionItems);
router.post('/', actionItemController.createActionItem);

module.exports = router;