class StaffDTO {
    constructor(staff) {
        this.id = staff.id;
        this.username = staff.username;
        this.name = staff.name;
        this.surname = staff.surname;
        this.email = staff.email;
        this.phone = staff.phone;
        this.address = staff.address;
        this.img = staff.img;
        this.sex = staff.sex;
        this.position = staff.position;
        this.createdAt = staff.createdat;
        this.birthday = staff.birthday;
        this.departmentId = staff.departmentid;
        this.departmentName = staff.departmentname;
    }
}

module.exports = StaffDTO;