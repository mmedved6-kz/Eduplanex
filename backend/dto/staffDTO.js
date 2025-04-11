class StaffDTO {
    constructor(staff) {
        this.id = staff.id;
        this.username = staff.username;
        this.name = staff.name;
        this.surname = staff.surname;
        this.email = staff.email;
        this.phone = staff.phone;
        this.img = staff.img;
        this.sex = staff.sex;
        this.position = staff.position;
        this.createdAt = staff.createdat;
        this.departmentId = staff.departmentid;
        this.departmentName = staff.departmentname;
        this.img = staff.img;
    }
}

module.exports = StaffDTO;