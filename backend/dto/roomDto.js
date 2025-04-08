class RoomDto {
    constructor(room) {
        this.id = room.id;
        this.name = room.name;
        this.roomType = room.room_type;
        this.capacity = room.capacity;
        this.buildingId = room.buildingid;
        this.buildingName = room.buildingname || null;
        this.equipment = room.equipment || [];
        this.createdAt = room.created_at;
    }
}

module.exports = RoomDto;