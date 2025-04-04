class BuildingDTO {
    constructor(building) {
      this.id = building.id;
      this.name = building.name;
      this.location = building.location;
      this.createdAt = building.created_at;
    }
  }
  
  module.exports = BuildingDTO;