const moduleModel = require('../models/moduleModel');

const getModules = async (req, res) => {
    try {
        const modules = await moduleModel.getAllModules();
        res.json(modules);
    } catch (error) {
        res.status(500).send('Error fetching modules');
    }
};

const createModule = async (req, res) => {
    const { module_name, course_id } = req.body;
    try {
        const newModule = await moduleModel.addModule(module_name, course_id);
        res.status(201).json(newModule);
    } catch (error) {
        res.status(500).send('Error adding module');
    }
};

module.exports = { getModules, createModule };
