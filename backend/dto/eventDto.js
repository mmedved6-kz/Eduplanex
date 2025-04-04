class EventDto {
    constructor(event) {
        this.id = event.id;
        this.title = event.title;
        this.description = event.description;
        this.startTime = event.starttime;
        this.endTime = event.endtime;
        this.eventType = event.eventtype;
        this.moduleId = event.moduleid;
        this.moduleName = event.modulename;
        this.roomId = event.roomid;
        this.roomName = event.roomname;
        this.staffId = event.staffid;
        this.staffName = event.staffname;
        this.studentId = event.studentid;
        this.studentName = event.studentname;
        this.createdAt = event.createdat;
        this.updatedAt = event.updatedat;

        this.maxCapacity = event.maxcapacity;
        this.studentIds = event.studentids || [];
        this.studentCount = event.studentcount; 
        this.resources = event.resources || [];
    }
}

module.exports = EventDto;