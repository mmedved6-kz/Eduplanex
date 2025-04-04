class RoomDto {
    constructor(room) {
        this.id = room.id;
        this.name = room.name;
        this.number = room.number;
        this.buildingId = room.buildingid;
        this.buildingName = room.buildingname;
        this.capacity = room.capacity;
        this.type = room.room_type;
        this.equipment = room.equipment;
    }
}

module.exports = RoomDto;