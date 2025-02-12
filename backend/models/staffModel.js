const db = require('../config/db');

const Staff = {
    // Get all staff
    getAll: async (limit, offset) => {
        return await db.any(`
          SELECT 
            s.*, 
            d.name AS departmentName
          FROM Staff s
          LEFT JOIN Department d ON s.departmentId = d.id
          LIMIT $1 OFFSET $2
        `, [limit, offset]);
      },

    // Get a staff member by ID
    getById: async (id) => {
        return await db.oneOrNone(`
            SELECT s.*, d.name as departmentName 
            FROM Staff s
            JOIN Department d ON s.departmentId = d.id
            WHERE s.id = $1
        `, [id]);
    },

    // Create a new staff member
    create: async (staff) => {
        const { username, name, surname, email, phone, address, img, sex, departmentId, birthday } = staff;
        return await db.one(`
            INSERT INTO Staff (username, name, surname, email, phone, address, img, sex, departmentId, birthday) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *, (SELECT name FROM Department WHERE id = $9) as departmentName`,
            [username, name, surname, email, phone, address, img, sex, departmentId, birthday]
        );
    },

    // Update a staff member
    update: async (id, updates) => {
        const { name, email } = updates;
        return await db.one(`
            UPDATE Staff 
            SET name = $1, email = $2 
            WHERE id = $3 
            RETURNING *, (SELECT name FROM Department WHERE id = Staff.departmentId) as departmentName`,
            [name, email, id]
        );
    },

    // Delete a staff member
    delete: async (id) => {
        return await db.none('DELETE FROM Staff WHERE id = $1', [id]);
    },

    count: async () => {
        return await db.one('SELECT COUNT(*) FROM Staff');
      },
};

module.exports = Staff;