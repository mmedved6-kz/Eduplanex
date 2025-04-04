class ModuleDTO {
    constructor(module) {
        this.id = module.id;
        this.name = module.name;
        this.departmentId = module.departmentId;
        this.departmentName = module.departmentName;
        this.coordinatorId = module.coordinatorId;
        this.coordinatorName = module.coordinatorName;
        this.courseId = module.courseId;
        this.createdAt = module.createdat;
        this.updatedAt = module.updatedat;
    }
}

module.exports = ModuleDTO;