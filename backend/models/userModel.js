const db = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
    getByUsername: async (username) => {
        return await db.oneOrNone(`
            SELECT * FROM Users WHERE username = $1
          `, [username]);
    },

    getById: async (id) => {
        return await db.oneOrNone(`
            SELECT * FROM Users WHERE id = $1
          `, [id]);
    },

    create: async (user) => {
        const { username, password, email, name, role } = user;
    
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        return await db.one(`
        INSERT INTO Users (username, password, email, name, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, username, email, name, role
        `, [username, hashedPassword, email, name, role]);
    },
};

module .exports = User;