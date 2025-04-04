class BuildingDTO {
    constructor(building) {
      this.id = building.id;
      this.name = building.name;
      this.code = building.code;
      this.address = building.address;
      this.campus = building.campus;
      this.createdAt = building.createdat;
      this.updatedAt = building.updatedat;
    }
  }
  
  module.exports = BuildingDTO;