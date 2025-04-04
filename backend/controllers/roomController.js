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
        } = req.query;

        const filters = {

        };

        const limit = parseInt(pageSize);
        const offset = (parseInt(page) - 1) * limit;

        const rooms = await Room.getAll(limit, offset, search, sortColumn, sortOrder, filters);
        const totalRooms = await Room.count(search, filters);
        const totalPages = Math.ceil(totalRooms.count / limit);

        const roomDtos = rooms.map(Room => new RoomDto(Room));
        res.json({
            items: roomDtos,
            currentPage: parseInt(page),
            totalPages,
            totalItems: totalRooms.count,
            pageSize: limit,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get an room by ID
const getRoomById = async (req, res) => {
    try {
        const room = await Room.getById(req.params.id);
        if (room) {
            const roomDto = new RoomDto(room);
            res.json(roomDto);
        } else {
            res.status(404).json({ error: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new room
const createRoom = async (req, res) => {
    try {
        const newRoom = await Room.create(req.body);
        const roomDto = new RoomDto(newRoom);
        res.status(201).json(roomDto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an room
const updateRoom = async (req, res) => {
    try {
        const updatedRoom = await Room.update(req.params.id, req.body);
        const roomDto = new RoomDto(updatedRoom);
        res.json(roomDto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an room
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