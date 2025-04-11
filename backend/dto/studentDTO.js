class StudentDTO {
    constructor(student) {
        this.id = student.id;
        this.username = student.username;
        this.name = student.name;
        this.surname = student.surname;
        this.email = student.email;
        this.phone = student.phone;
        this.sex = student.sex;
        this.enrollmentDate = student.enrollment_date;
    }
}

module.exports = StudentDTO;