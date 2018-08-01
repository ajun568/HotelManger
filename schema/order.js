let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let order = new Schema({
  name:{
    type: String
  },
  idcard:{
    type:String
  },
  nationality: {
    type: Number
  },
  begin_date:{
    type: Date
  },
  end_date:{
    type: Date
  },
  house_num:{
    type: String
  },
  order: {
    type: Number,
    default: 0
  },
  room_type_name:{
    type: String,
  },
  price: {
    type: String
  },
  hotel_username:{
    type: String
  },
  fin: {
    type: Boolean,
    default: false
  }
});

module.exports = order;
