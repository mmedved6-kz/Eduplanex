class RoomDto {
    constructor(room) {
        this.id = room.id;
        this.name = room.name;
        this.number = room.number;
        this.buildingId = room.buildingid;
        this.buildingName = room.buildingname;
        this.capacity = room.capacity;
        this.type = room.type;
        this.createdAt = room.createdat;
        this.updatedAt = room.updatedat;
    }
}

module.exports = RoomDto;