class StaffDTO {
    constructor(staff) {
        this.id = staff.id;
        this.name = staff.name;
        this.email = staff.email;
        this.departmentId = staff.departmentId;
    }
}

module.exports = StaffDTO;