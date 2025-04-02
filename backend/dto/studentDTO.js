class StudentDTO {
    constructor(student) {
        this.id = student.id;
        this.name = student.name;
        this.email = student.email;
        this.courseId = student.courseid; // Only include relevant fields
        this.courseName = student.coursename;
        this.surname = student.surname;
        this.phone = student.phone;
        this.address = student.address;
    }
}

module.exports = StudentDTO;