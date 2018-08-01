let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let client = new Schema({
  client_username:{
    type: String
  },
  b_username:{
    type: String
  },
  client_name:{
    type: String
  },
  idcard:{
    type: String
  },
  avatar:{
    type: String
  },
  nationality:{
    type:Number
  },
  country:{
    type: String
  },
  time:{
    type: Date
  },
  todo:{
    type: String
  },
  job: {
    type: String
  },
  disable:{
    type: Number,
    default: 1
  }
});

module.exports = client;
