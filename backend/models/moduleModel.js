const db = require('../config/db');

// Fetch all modules
const getAllModules = async () => {
    return db.any('SELECT * FROM modules');
};

// Add a new module linked to a course
const addModule = async (module_name, course_id) => {
    return db.one(
        'INSERT INTO modules (module_name, course_id) VALUES ($1, $2) RETURNING *',
        [module_name, course_id]
    );
};

module.exports = { getAllModules, addModule };
