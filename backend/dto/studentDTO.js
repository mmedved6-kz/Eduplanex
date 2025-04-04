class StudentDTO {
    constructor(student) {
        this.id = student.id;
        this.name = student.name;
        this.email = student.email;
        this.surname = student.surname;
        this.phone = student.phone;
        this.sex = student.sex;
        this.enrollmentDate = student.enrollment_date;
        this.createdAt = student.createdat;
        this.updatedAt = student.updatedat;
    }
}

module.exports = StudentDTO;