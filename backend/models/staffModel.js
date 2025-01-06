const db = require('../config/db');

// Fetch all staff members
const getAllStaff = async () => {
    return db.any('SELECT * FROM staff');
};

// Add a new staff member
const addStaff = async (first_name, last_name, email, role, flexibility_score) => {
    return db.one(
        'INSERT INTO staff (first_name, last_name, email, role, flexibility_score) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [first_name, last_name, email, role, flexibility_score]
    );
};

module.exports = { getAllStaff, addStaff };
