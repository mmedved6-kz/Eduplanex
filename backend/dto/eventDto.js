class EventDto {
    constructor(event) {
        this.id = event.id;
        this.title = event.title;
        this.eventDate = event.event_date;
        this.startTime = event.timeslot_start; // Use alias from query
        this.endTime = event.timeslot_end;     // Use alias from query
        this.tag = event.tag;
        this.moduleName = event.modulename;
        this.courseName = event.coursename;
        this.roomName = event.roomname;
        this.staffName = event.staffname;
        this.description = event.description; // Assuming description exists in event table
        // <<< ADD THIS LINE >>>
        this.timeslotId = event.timeslot_id; // Map the timeslot_id from the query result
        // Add original IDs if needed by frontend logic (like constraint checking)
        this.roomId = event.roomid;
        this.staffId = event.staffid;
        this.moduleId = event.moduleid;
        this.courseId = event.courseid;
    }

    formatTimeOnly(datetimeStr) {
        // If it's already just a time string (e.g., "09:00:00"), return as is
        if (/^\d{2}:\d{2}(:\d{2})?$/.test(datetimeStr)) {
            return datetimeStr;
        }
        
        // Otherwise parse as date and extract time
        try {
            const date = new Date(datetimeStr);
            return date.toTimeString().split(' ')[0]; // Gets "HH:MM:SS" part
        } catch (e) {
            return datetimeStr; 
        }
    }
}

module.exports = EventDto;