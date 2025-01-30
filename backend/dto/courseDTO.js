class CourseDTO {
    constructor(course) {
        this.id = course.id;
        this.name = course.name;
        this.departmentId = course.departmentId;
    }
}

module.exports = CourseDTO;