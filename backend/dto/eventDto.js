class EventDto {
    constructor(event) {
        this.id = event.id;
        this.title = event.title;
        this.description = event.description;
        
        // Format dates properly to ISO strings for reliable parsing in frontend
        this.startTime = event.start_time ? new Date(event.start_time).toISOString() : null;
        this.endTime = event.end_time ? new Date(event.end_time).toISOString() : null;
        
        this.startDate = this.startTime ? new Date(this.startTime).toLocaleDateString() : "N/A";
        this.startTimeFormatted = this.startTime ? new Date(this.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A";
        
        this.endDate = this.endTime ? new Date(this.endTime).toLocaleDateString() : "N/A";
        this.endTimeFormatted = this.endTime ? new Date(this.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A";
        
        // Other fields as before
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
}

module.exports = EventDto;