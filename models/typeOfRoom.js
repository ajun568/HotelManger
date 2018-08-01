let mongoose = require('mongoose');
let TypeOfRoomSchema = require('../schema/typeOfRoom');

let TypeOfRoom = mongoose.model('room_types', TypeOfRoomSchema);

module.exports = TypeOfRoom;
