const Staff = require('../models/staffModel');
const StaffDTO = require('../dto/staffDTO');
const { update } = require('../models/studentModel');

const getAllStaff = async (req, res) => {
    try {
        const staff = await Staff.getAll();
        const staffDTOs = staff.map(staff => new StaffDTO(staff));
        res.json(staffDTOs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Staff by Id
const getStaffById = async (req, res) => {
    try {
        const staff = await Staff.getById(req.params.id);
        if (staff) {
            const staffDto = new StaffDto(staff);
            res.json(staffDto);
        } else {
            res.status(404).json({ error: 'Staff not found '});
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new staff
const createStaff = async (req, res) => {
    try {
        const newStaff = await Staff.create(req.body);
        const staffDto = new StaffDto(newStaff);
        res.status(201).json(staffDto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update staff
const updateStaff = async (req, res) => {
    try{
        const updatedStaff = await Staff.update(req.params.id, req.body);
        const staffDto = new StaffDto(updatedStaff);
        res.json(staffDto);
    } catch (error) {
        res.json(500).json({ error: error.message });
    }
};

// Delete staff
const deleteStaff = async (req, res) => {
    try {
        await Staff.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
};