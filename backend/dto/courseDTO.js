class CourseDTO {
    constructor(course) {
        this.id = course.id;
        this.name = course.name;
        this.description = course.description;
        this.creditHourse = course.credit_hours;
        this.departmentId = course.departmentid;
        this.departmentName = course.departmentname;
        this.createdAt = course.createdat;
    }
}

module.exports = CourseDTO;