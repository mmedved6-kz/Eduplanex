class StudentDTO {
    constructor(student) {
        this.id = student.id;
        this.name = student.name;
        this.email = student.email;
        this.courseId = student.courseId; // Only include relevant fields
        // Add other fields as needed
    }
}

module.exports = StudentDTO;