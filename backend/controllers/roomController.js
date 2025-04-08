const Room = require('../models/roomModel');
const RoomDto = require('../dto/roomDto');

// Get all rooms
const getAllRooms = async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 10,
            search = '',
            sortColumn = 'room.name',
            sortOrder = 'ASC',
            buildingId = null,
            roomType = null,
            minCapacity = null,
        } = req.query;

        const filters = {
            buildingId: buildingId || null,
            roomType: roomType || null,
            minCapacity: minCapacity || null
        };

        const limit = parseInt(pageSize);
        const offset = (parseInt(page) - 1) * limit;

        const rooms = await Room.getAll(limit, offset, search, sortColumn, sortOrder, filters);
        const totalRooms = await Room.count(search, filters);
        const totalPages = Math.ceil(totalRooms.count / limit);

        const roomDtos = rooms.map(room => new RoomDto(room));
        res.json({
            items: roomDtos,
            currentPage: parseInt(page),
            totalPages,
            totalItems: totalRooms.count,
            pageSize: limit,
        });
    } catch (error) {
        console.error('Error in getAllRooms:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get a room by ID
const getRoomById = async (req, res) => {
    try {
        const room = await Room.getById(req.params.id);
        if (room) {
            const roomDto = new RoomDto(room);
            res.json(roomDto);
        } else {
            res.status(404).json({ error: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new room
const createRoom = async (req, res) => {
    try {
        const { name, room_type, capacity, buildingId, equipment } = req.body;
        
        // Generate a room ID if not provided
        let id = req.body.id;
        if (!id) {
            // Generate a room ID based on building and type
            const prefix = 'RM';
            const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            id = `${prefix}${randomSuffix}`;
        }
        
        const newRoom = await Room.create({
            id,
            name,
            room_type,
            capacity,
            buildingId,
            equipment: equipment || []
        });
        
        const roomDto = new RoomDto(newRoom);
        res.status(201).json(roomDto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a room
const updateRoom = async (req, res) => {
    try {
        const { name, room_type, capacity, buildingId, equipment } = req.body;
        const updatedRoom = await Room.update(req.params.id, {
            name,
            room_type,
            capacity,
            buildingId,
            equipment: equipment || []
        });
        
        const roomDto = new RoomDto(updatedRoom);
        res.json(roomDto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a room
const deleteRoom = async (req, res) => {
    try {
        await Room.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
};