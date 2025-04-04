class DepartmentDto {
    constructor(department) {
        this.id = department.id;
        this.name = department.name;
        this.description = department.description;
        this.createdAt = department.createdat;
        this.updatedAt = department.updatedat;
    }
}

module.exports = DepartmentDto;