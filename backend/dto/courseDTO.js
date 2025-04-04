class CourseDTO {
    constructor(course) {
        this.id = course.id;
        this.name = course.name;
        this.departmentId = course.departmentid;
        this.departmentName = course.departmentname;
        this.coordinatorId = course.coordinatorid;
        this.coordinatorName = course.coordinatorname;
        this.durationYears = course.durationyears;
        this.createdAt = course.createdat;
        this.updatedAt = course.updatedat;
    }
}

module.exports = CourseDTO;