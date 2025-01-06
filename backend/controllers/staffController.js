const staffModel = require('../models/staffModel');

const getStaff = async (req, res) => {
    try {
        const staff = await staffModel.getAllStaff();
        res.json(staff);
    } catch (error) {
        res.status(500).send('Error fetching staff');
    }
};

const createStaff = async (req, res) => {
    const { first_name, last_name, email, role, flexibility_score } = req.body;
    try {
        const newStaff = await staffModel.addStaff(first_name, last_name, email, role, flexibility_score);
        res.status(201).json(newStaff);
    } catch (error) {
        res.status(500).send('Error adding staff member');
    }
};

module.exports = { getStaff, createStaff };
