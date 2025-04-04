class DepartmentDto {
    constructor(department) {
        this.id = department.id;
        this.name = department.name;
        this.code = department.code;
        this.description = department.description;
        this.staffId = department.staffid;
        this.staffName = department.staffname;
        this.createdAt = department.createdat;
        this.updatedAt = department.updatedat;
    }
}

module.exports = DepartmentDto;