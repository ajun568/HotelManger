let mongoose = require('mongoose');
let RoomListSchema = require('../schema/roomList');

let RoomList = mongoose.model('room_list', RoomListSchema);

module.exports = RoomList;
