const Event = require('../models/eventModel');
const EventDto = require('../dto/eventDto');

// Get all events
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.getAll();
        const eventDtos = events.map(event => new EventDto(event));
        res.json(eventDtos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get an event by ID
const getEventById = async (req, res) => {
    try {
        const event = await Event.getById(req.params.id);
        if (event) {
            const eventDto = new EventDto(event);
            res.json(eventDto);
        } else {
            res.status(404).json({ error: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new event
const createEvent = async (req, res) => {
    try {
        const newEvent = await Event.create(req.body);
        const eventDto = new EventDto(newEvent);
        res.status(201).json(eventDto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an event
const updateEvent = async (req, res) => {
    try {
        const updatedEvent = await Event.update(req.params.id, req.body);
        const eventDto = new EventDto(updatedEvent);
        res.json(eventDto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an event
const deleteEvent = async (req, res) => {
    try {
        await Event.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
};