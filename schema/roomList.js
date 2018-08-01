let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let roomList = new Schema({
  house_type_id: {
    type: Schema.Types.ObjectId,
  },
  house_type_name:{
    type: String
  },
  house_num: {
    type: String
  },
  username:{
    type: String
  },
  house_status: {
    type: Number,
    default:3
  },
  floor: {
    type: Number
  },
  order:{
    type:Object
  }
});

module.exports = roomList;
