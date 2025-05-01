class ModuleDTO {
    constructor(module) {
        this.id = module.id;
        this.name = module.name;
        this.description = module.description;
        this.courseId = module.courseid;
        this.courseName = module.coursename
    }
}

module.exports = ModuleDTO;