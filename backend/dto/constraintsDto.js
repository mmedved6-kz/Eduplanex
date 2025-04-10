class ConstraintsDto {
    constructor(constraints) {
      this.id = constraints.id;
      this.constraintType = constraints.constraint_type;
      this.entityType = constraints.entity_type;
      this.entityId = constraints.entity_id;
      this.constraintName = constraints.constraint_name;
      this.constraintValue = constraints.constraint_value;
    }
  }
  
  module.exports = ConstraintsDto;