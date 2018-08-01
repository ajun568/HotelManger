let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let typeOfRoom = new Schema({
  username: {
    type: String,
    required: true
  },
  room_type_name: {
    type: String,
    default: ''
  },
  room_type_flag: {
    type: Number,
    default: 0
  },
  room_type_price: {
    type: Number,
    default: 0
  },
  room_num: {
    type: Number,
    default: 0
  },
  breakfeast: {
    type: Number,
    default: 0
  },
  pic: {
    type: String,
    default: 0
  },
  room_area:{
    type: Number,
    default: 0
  },
  bed_type:{
    type: String,
    default: '0*0'
  } 
});

module.exports = typeOfRoom;
