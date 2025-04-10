// controllers/actionItemController.js
const ActionItem = require('../models/actionItemModel');

const getAllActionItems = async (req, res) => {
  try {
    const { priority, type } = req.query;
    const filters = {};
    
    if (priority) filters.priority = priority;
    if (type) filters.type = type;
    
    const items = await ActionItem.getAll(filters);
    res.json({ items });
  } catch (error) {
    console.error('Error fetching action items:', error);
    res.status(500).json({ error: error.message });
  }
};

const createActionItem = async (req, res) => {
  try {
    const newItem = await ActionItem.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating action item:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllActionItems,
  createActionItem
};