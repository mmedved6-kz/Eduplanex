const Department = require('../models/departmentModel');
const DepartmentDto = require('../dto/departmentDto');

// Get all Departments
const getAllDepartments = async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 1,
            search = '', 
            sortColumn = 'staff.name', 
            sortOrder = 'ASC',
        } = req.query;

        const filters = {

        };

        const limit = parseInt(pageSize);
        const offset = (parseInt(page) - 1) * limit;

        const departments = await Department.getAll(limit, offset, search, sortColumn, sortOrder, filters);
        const totalDepartments = await Department.count(search, filters);
        const totalPages = Math.ceil(totalDepartments.count / limit);
        
        const departmentDtos = departments.map(department => new DepartmentDto(department));
        res.json({
            items: departmentDtos,
            currentPage: parseInt(page),
            totalPages,
            totalItems: totalDepartments.count,
            pageSize: limit,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a department by ID
const getDepartmentById = async (req, res) => {
    try {
        const department = await Department.getById(req.params.id);
        if (department) {
            const DepartmentDto = new DepartmentDto(department);
            res.json(DepartmentDto);
        } else {
            res.status(404).json({ error: 'Department not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new department
const createDepartment = async (req, res) => {
    try {
        const newDepartment = await Department.create(req.body);
        const DepartmentDto = new DepartmentDto(newDepartment);
        res.status(201).json(DepartmentDto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a department
const updateDepartment = async (req, res) => {
    try {
        const updatedDepartment = await Department.update(req.params.id, req.body);
        const DepartmentDto = new DepartmentDto(updatedDepartment);
        res.json(DepartmentDto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a department
const deleteDepartment = async (req, res) => {
    try {
        await Department.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
};