class EventDto {
    constructor(event) {
        this.id = event.id;
        this.title = event.title;
        this.description = event.description;
        this.eventDate = event.event_date;
        
        this.timeslotId = event.timeslot_id;
        this.timeslotStart = event.timeslot_start;
        this.timeslotEnd = event.timeslot_end;
        this.duration = event.duration_minutes;
        
        this.startTime = event.start_time ? 
            this.formatTimeOnly(event.start_time) : null;
        this.endTime = event.end_time ? 
            this.formatTimeOnly(event.end_time) : null;
        
        this.date = this.eventDate ? 
            new Date(this.eventDate).toLocaleDateString() : "N/A";
        this.timeRange = (this.timeslotStart && this.timeslotEnd) ? 
            `${this.timeslotStart} - ${this.timeslotEnd}` : "N/A";
        
        this.tag = event.tag;
        this.moduleId = event.moduleid;
        this.moduleName = event.modulename || "N/A";
        this.roomId = event.roomid;
        this.roomName = event.roomname || "N/A";
        this.staffId = event.staffid;
        this.staffName = event.staffname || "N/A";
        this.courseId = event.courseid;
        this.courseName = event.coursename || "N/A";
        this.student_count = event.student_count || 0;
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