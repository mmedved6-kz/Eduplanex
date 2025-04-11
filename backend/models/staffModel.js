const db = require('../config/db');

const Staff = {
    // Get all staff
    getAll: async (limit, offset, searchQuery, sortColumn, sortOrder, filters) => {
        // Validate sortColumn and sortOrder preventing SQL injection - CAN BE IGNORED OR REMOVED LATER
        const validColumns = ['staff.name', 'department.name', 'staff.email', 'staff.phone', 'staff.surname', 'staff.id'];
        const defaultSort = 'staff.name';
        
        const actualSortColumn = validColumns.includes(sortColumn) ? sortColumn : defaultSort;
        const actualSortOrder = ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : 'ASC';
        
        const params = [`%${searchQuery}%`, limit, offset];
        
        let query = `
            SELECT 
                staff.*, 
                department.name AS departmentName
            FROM Staff staff
            LEFT JOIN Department department ON staff.departmentId = department.id
            WHERE (staff.name ILIKE $1 OR staff.email ILIKE $1 OR department.name ILIKE $1)
        `;

        if (filters.departmentId) {
            params.push(filters.departmentId);
            query += ` AND event.departmentId = $${params.length}`;
        }

        if (filters.sex) {
            // Validate sex value against allowed enum values
            const validSexValues = ['MALE', 'FEMALE'];
            if (validSexValues.includes(filters.sex.toUpperCase())) {
                params.push(filters.sex.toUpperCase());
                query += ` AND staff.sex = $${params.length}`
            }
        }

        query += ` ORDER BY ${actualSortColumn} ${actualSortOrder}
                  LIMIT $2 OFFSET $3`;

        return await db.any(query, params);
    },

    // Get a staff member by ID
    getById: async (id) => {
        return await db.oneOrNone(`
            SELECT staff.*, department.name as departmentName 
            FROM Staff staff
            JOIN Department department ON staff.departmentId = department.id
            WHERE staff.id = $1
        `, [id]);
    },

    // Create a new staff member
    create: async (staff) => {
        const { id, username, name, surname, email, phone, img, sex, departmentId, position } = staff;
        
        return await db.tx(async t => {
            const newStaff = await t.one(
            `INSERT INTO Staff 
            (id, username, name, surname, email, phone, img, sex, departmentId, position) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *, (SELECT name FROM Department WHERE id = $9) as departmentName`,
            [id, username, name, surname, email, phone, img, sex, departmentId, position]  
        );

            return newStaff;
        });
    },

    // Update a staff member
    update: async (id, updates) => {
        const { username, name, surname, email, phone, img, sex, departmentId, position } = updates;
        return await db.tx(async t => {
            const updatedEvent = await t.one(
            `
            UPDATE Staff 
            SET username = $1, name = $2, surname = $3, email = $4, phone = $5, img = $6, sex = $7, departmentId = $8, position = $9
            WHERE id = $10 
            RETURNING *, (SELECT name FROM Department WHERE id = Staff.departmentId) as departmentName`,
            [username, name, surname, email, phone, img, sex, departmentId, position, id]
        );
        return updatedEvent;
    });
    },

    // Delete a staff member
    delete: async (id) => {
        return await db.tx(async t => {
            await t.one('DELETE FROM Staff WHERE id = $1', [id]);

            return await t.none('DELETE FROM Staff WHERE id = $1', [id]);
        });
    },

    count: async (searchQuery, filters) => {
        const params = [`%${searchQuery}%`];
        
        let query = `
            SELECT COUNT(*) 
            FROM Staff staff
            LEFT JOIN Department department ON staff.departmentId = department.id
            WHERE (staff.name ILIKE $1 OR staff.email ILIKE $1 OR department.name ILIKE $1)
        `;

        if (filters.departmentId) {
            params.push(filters.departmentId);
            query += ` AND department.id = $${params.length}`;
        }

        if (filters.sex) {
            params.push(filters.sex);
            query += ` AND staff.sex = $${params.length}`;
        }

        return await db.one(query, params);
    },
};

module.exports = Staff;