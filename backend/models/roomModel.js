const db = require('../config/db');

const Room = {
    // Get all rooms with pagination, search, and sorting
    getAll: async (limit, offset, searchQuery, sortColumn, sortOrder, filters = {}) => {
        // Validate sortColumn and sortOrder to prevent SQL injection
        const validColumns = ['room.name', 'room.capacity', 'room.id', 'building.name', 'room.room_type'];
        const defaultSort = 'room.name';
    
        const actualSortColumn = validColumns.includes(sortColumn) ? sortColumn : defaultSort;
        const actualSortOrder = ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : 'ASC';
        
        const params = [`%${searchQuery}%`, limit, offset];

        let query = `
            SELECT 
                room.*,
                building.name AS buildingName
            FROM Room room
            LEFT JOIN Building building ON room.buildingId = building.id
            WHERE (room.name ILIKE $1 OR building.name ILIKE $1)
        `;

        if (filters.buildingId) {
            params.push(filters.buildingId);
            query += ` AND room.buildingId = $${params.length}`;
        }

        if (filters.roomType) {
            params.push(filters.roomType);
            query += ` AND room.room_type = $${params.length}`;
        }

        if (filters.minCapacity) {
            const minCapacity = parseInt(filters.minCapacity);
            if (!isNaN(minCapacity)) {
                params.push(minCapacity);
                query += ` AND room.capacity >= $${params.length}`;
            }
        }
          
        query += ` ORDER BY ${actualSortColumn} ${actualSortOrder}
                LIMIT $2 OFFSET $3`;

        return await db.any(query, params);
    },

    // Get a room by ID
    getById: async (id) => {
        return await db.oneOrNone(`
            SELECT 
                room.*,
                building.name AS buildingName
            FROM Room room
            LEFT JOIN Building building ON room.buildingId = building.id
            WHERE room.id = $1
        `, [id]);
    },

    // Create a new room
    create: async (room) => {
        const { id, name, room_type, capacity, buildingId, equipment } = room;
        return await db.one(
            `INSERT INTO Room 
             (id, name, room_type, capacity, buildingId, equipment) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *, (SELECT name FROM Building WHERE id = $5) as buildingName`,
            [id, name, room_type, capacity, buildingId, equipment]
        );
    },

    // Update a room
    update: async (id, updates) => {
        const { name, room_type, capacity, buildingId, equipment } = updates;
        return await db.one(
            `UPDATE Room SET 
             name = $1, 
             room_type = $2, 
             capacity = $3, 
             buildingId = $4, 
             equipment = $5
             WHERE id = $6 
             RETURNING *, (SELECT name FROM Building WHERE id = $4) as buildingName`,
            [name, room_type, capacity, buildingId, equipment, id]
        );
    },

    // Delete a room
    delete: async (id) => {
        return await db.none('DELETE FROM Room WHERE id = $1', [id]);
    },

    // Count total rooms with filters
    count: async (searchQuery, filters = {}) => {
        const params = [`%${searchQuery}%`];
        
        let query = `
            SELECT COUNT(*) 
            FROM Room room
            LEFT JOIN Building building ON room.buildingId = building.id
            WHERE (room.name ILIKE $1 OR building.name ILIKE $1)
        `;

        if (filters.buildingId) {
            params.push(filters.buildingId);
            query += ` AND room.buildingId = $${params.length}`;
        }

        if (filters.roomType) {
            params.push(filters.roomType);
            query += ` AND room.room_type = $${params.length}`;
        }

        if (filters.minCapacity) {
            const minCapacity = parseInt(filters.minCapacity);
            if (!isNaN(minCapacity)) {
                params.push(minCapacity);
                query += ` AND room.capacity >= $${params.length}`;
            }
        }

        return await db.one(query, params);
    },
};

module.exports = Room;