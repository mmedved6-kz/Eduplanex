const Module = require('../models/moduleModel');
const ModuleDTO = require('../dto/moduleDTO');

// Get all modules
const getAllModules = async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 10,
            search = '', 
            sortColumn = 'module.name', 
            sortOrder = 'ASC',
            courseId = null,
        } = req.query;

        const filters = {
            courseId: courseId ? parseInt(courseId) : null,
          };
      
        const limit = parseInt(pageSize);
        const offset = (parseInt(page) - 1) * limit;

        const modules = await Module.getAll(limit, offset, search, sortColumn, sortOrder, filters);
        const totalModules = await Module.count(search, filters);
        const totalPages = Math.ceil(totalModules.count / limit);

        const moduleDTOs = modules.map(module => new ModuleDTO(module));
        res.json({
            items: moduleDTOs,
            currentPage: parseInt(page),
            totalPages,
            totalItems: totalModules.count,
            pageSize: limit,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a module by ID
const getModuleById = async (req, res) => {
    try {
        const module = await Module.getById(req.params.id);
        if (module) {
            const moduleDTO = new ModuleDTO(module);
            res.json(moduleDTO);
        } else {
            res.status(404).json({ error: 'Module not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new module
const createModule = async (req, res) => {
    try {
        const newModule = await Module.create(req.body);
        const moduleDTO = new ModuleDTO(newModule);
        res.status(201).json(moduleDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a module
const updateModule = async (req, res) => {
    try {
        const updatedModule = await Module.update(req.params.id, req.body);
        const moduleDTO = new ModuleDTO(updatedModule);
        res.json(moduleDTO);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a module
const deleteModule = async (req, res) => {
    try {
        await Module.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllModules,
    getModuleById,
    createModule,
    updateModule,
    deleteModule,
};