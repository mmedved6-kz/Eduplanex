const Staff = require('../models/staffModel');
const StaffDTO = require('../dto/staffDTO');

const getAllStaff = async (req, res) => {
    try {
        const staff = await Staff.getAll();
        const staffDTOs = staff.map(staff => new StaffDTO(staff));
        res.json(staffDTOs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getStaffById = async (req, res) => {
    try {
        const staff = await Staff.getById(req.params.id);
        if (staff) {
            const staffDto = new StaffDTO(staff);
            res.json(staffDto);
        } else {
            res.status(404).json({ error: 'Staff not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createStaff = async (req, res) => {
    try {
        const newStaff = await Staff.create(req.body);
        const staffDto = new StaffDTO(newStaff);
        res.status(201).json(staffDto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateStaff = async (req, res) => {
    try {
        const updatedStaff = await Staff.update(req.params.id, req.body);
        const staffDto = new StaffDTO(updatedStaff);
        res.json(staffDto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteStaff = async (req, res) => {
    try {
        await Staff.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
};