const Event = require('../models/eventModel');
const EventDto = require('../dto/eventDto');
const db = require("../config/db");

// Get all events
const getAllEvents = async (req, res) => {
    try {
      const {
        page = 1,
        pageSize = 10,
        search = '', 
        sortColumn = 'event.title', 
        sortOrder = 'ASC',
        staffId = null,
      } = req.query;
  
      const filters = {
        staffId: staffId || null,
        };
      
      console.log('Event filters:', filters); // Debug log
      
      const limit = parseInt(pageSize);
      const offset = (parseInt(page) - 1) * limit;
  
      const events = await Event.getAll(limit, offset, search, sortColumn, sortOrder, filters);
      const totalEvents = await Event.count(search, filters);
      const totalPages = Math.ceil(totalEvents.count / limit);
  
      const eventDtos = events.map(event => new EventDto(event));
      res.json({
        items: eventDtos,
        currentPage: parseInt(page),
        totalPages, 
        totalItems: totalEvents.count,
        pageSize: limit,
      });
    } catch (error) {
      console.error('Error in getAllEvents:', error);
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
        const eventData = {
            id: req.body.id,
            title: req.body.title,
            description: req.body.description,
            start_time: new Date(req.body.start_time || req.body.start),
            end_time: new Date(req.body.end_time || req.body.end),
            moduleId: req.body.moduleId || req.body.module_id,
            roomId: req.body.roomId || req.body.room_id,
            staffId: req.body.staffId || req.body.staff_id,
            courseId: req.body.courseId || req.body.course_id,
            student_count: req.body.student_count || req.body.student_count || 0,
            tag: req.body.event_type || req.body.tag || 'CLASS',
            students: req.body.students || []
        };

        console.log('Creating event with students:', eventData.students);
        const newEvent = await Event.create(eventData);
        const eventDto = new EventDto(newEvent);
        res.status(201).json(eventDto);
    } catch (error) {
        console.log('Error creating event:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update an event
const updateEvent = async (req, res) => {
    try {
        console.log('Updating event with ID:', req.params.id);
        console.log('Update data:', req.body); 

        const eventData = {
            title: req.body.title,
            description: req.body.description,
            start_time: new Date(req.body.start_time || req.body.start),
            end_time: new Date(req.body.end_time || req.body.end),
            moduleId: req.body.moduleId || req.body.module_id,
            roomId: req.body.roomId || req.body.room_id,
            staffId: req.body.staffId || req.body.staff_id,
            courseId: req.body.courseId || req.body.course_id,
            student_count: req.body.student_count || req.body.student_count || 0,
            tag: req.body.event_type || req.body.tag || 'CLASS',
            students: req.body.students || [] 
        };

        console.log('Update data with students:', eventData.students);
        const updatedEvent = await Event.update(req.params.id, eventData);
        const eventDto = new EventDto(updatedEvent);
        res.json(eventDto);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete an event
const deleteEvent = async (req, res) => {
    try {
        console.log('Deleting event with ID:', req.params.id);
        await Event.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: error.message });
    }
};

const getCalendarEvents = async (req, res) => {
  try {
    // Get the next 30 days of events
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    const todayStr = today.toISOString();
    const thirtyDaysLaterStr = thirtyDaysLater.toISOString();
    
    const query = `
      SELECT 
        event.*,
        module.name AS modulename,
        course.name AS coursename,
        room.name AS roomname,
        staff.name AS staffname
      FROM Event event
      LEFT JOIN Module module ON event.moduleId = module.id
      LEFT JOIN Room room ON event.roomId = room.id
      LEFT JOIN Staff staff ON event.staffId = staff.id
      LEFT JOIN Course course ON event.courseId = course.id
      WHERE event.startTime >= $1 AND event.startTime <= $2
      ORDER BY event.startTime ASC
    `;
    
    const events = await db.any(query, [todayStr, thirtyDaysLaterStr]);
    
    // Convert to DTO
    const eventDtos = events.map(event => new EventDto(event));
    
    res.json({ items: eventDtos });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    
    // For development, return some sample events if there's an error
    const sampleEvents = [
      {
        id: "EVT1001",
        title: "Introduction to Computer Science",
        startTime: new Date(2025, 3, 11, 10, 0).toISOString(),
        endTime: new Date(2025, 3, 11, 12, 0).toISOString(),
        description: "First lecture of the semester",
        tag: "CLASS",
        moduleName: "CS101",
        roomName: "R101",
        staffName: "Dr. Jane Smith"
      },
      {
        id: "EVT1002",
        title: "Advanced Database Systems",
        startTime: new Date(2025, 3, 12, 14, 0).toISOString(),
        endTime: new Date(2025, 3, 12, 16, 0).toISOString(),
        description: "SQL optimization techniques",
        tag: "CLASS",
        moduleName: "CS301",
        roomName: "R201",
        staffName: "Prof. John Davis"
      },
      {
        id: "EVT1003",
        title: "Web Development Workshop",
        startTime: new Date(2025, 3, 15, 9, 0).toISOString(),
        endTime: new Date(2025, 3, 15, 12, 0).toISOString(),
        description: "Hands-on React training",
        tag: "WORKSHOP",
        moduleName: "CS205",
        roomName: "L101",
        staffName: "Dr. Alice Johnson"
      }
    ];
    
    res.json({ items: sampleEvents });
  }
};

const getEventStudents = async (req, res) => {
    try {
      const eventId = req.params.id;
      console.log('Fetching students for event:', eventId);
      
      // First check if the event exists
      const eventExists = await db.oneOrNone('SELECT id FROM Event WHERE id = $1', [eventId]);
      
      if (!eventExists) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      // Query to get students associated with the event
      const query = `
        SELECT student.* 
        FROM Student student
        JOIN event_students es ON student.id = es.studentId 
        WHERE es.eventId = $1
      `;
      
      const students = await db.any(query, [eventId]);
      console.log(`Found ${students.length} students for event ${eventId}`);
      
      res.json(students);
    } catch (error) {
      console.error('Error fetching event students:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch event students' });
    }
  };

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getCalendarEvents,
    getEventStudents,
};