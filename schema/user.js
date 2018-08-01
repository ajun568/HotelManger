let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let moment = require('moment');

let user = new Schema({
  username: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  name: {
    type: String,
    default: '请设置店铺名称'
  },
  term: {
    type: Number,
    default: -1
  },
  phone: {
    type: String,
    default: '请设置手机号'
  },
  region: {
    type: String,
    default: '请设置地区'
  },
  address: {
    type: String,
     default: '请设置详细地址'
  },
  fir_flag: {
    type: Boolean,
    default: false
  },
  avatar:{
    type:String
  },
  creat_time: {
    type: Date,
    default: Date.now()
  },
});

module.exports = user;
