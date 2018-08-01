var express = require('express');
var router = express.Router();
var RoomList = require('../models/roomList');
var TypeOfRoom = require('../models/typeOfRoom');
var Order = require('../models/order')
var jwt = require('jsonwebtoken');
var moment = require('moment');
/* GET home page. */


router.post('/orderB', function (req, res) {
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    var info = {
      house_num: req.body.house_num,
      name: req.body.name,
      idcard: req.body.idCard,
      begin_date: req.body.beginDate,
      nationality: req.body.nationality,
      end_date: req.body.endDate,
      room_type_name: req.body.room_type_name,
      hotel_username: decode.username,
      price: req.body.price
    }
    console.log(info);
    var mongoInsert = new Order(info);
    mongoInsert.save()
    res.json({
      message: '订单生成成功'
    })
  })
})


router.post('/orderC', function (req, res) {
  var info = {
    name: req.body.name,
    idcard: req.body.idCard,
    begin_date: req.body.beginDate,
    nationality: req.body.nationality,
    end_date: req.body.endDate,
    room_type_name: req.body.room_type_name,
    hotel_username: req.body.username,
    price: req.body.price,
  };
  console.log(info);
  RoomList.find({
    house_type_name: info.room_type_name,
    username: info.hotel_username,
    house_status: 3
  }, function (err, doc) {
    Order.find({
      begin_date: info.begin_date
    }, function (err, rs) {
      console.log(rs);
      var orderNum = [];
      if (rs.length > 0) {
        orderNum = rs.map(item => item.house_num);
        var data = doc.filter(item => orderNum.indexOf(item.house_num));
        var random = parseInt(Math.random() * data.length);
        info.house_num = data[random].house_num;
        info.order = 1;
        var mongoInsert = new Order(info);
        mongoInsert.save();
        res.json({
          message: '预定成功'
        })
      } else {
        var random = parseInt(Math.random() * doc.length);
        info.house_num = doc[random].house_num;
        info.order = 1;
        var mongoInsert = new Order(info);
        mongoInsert.save();
        res.json({
          message: '预定成功'
        })
      }
    })
  })
})


router.post('/list', function (req, res) {
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    var info = {
      _id: req.body.id,
      room_type_name: req.body.room_type_name,
      nationality: req.body.nationality,
      pageNum: req.body.pageNum, //当前页码
      pageSize: req.body.pageSize, ///每页数量
    };
    console.log(info);
    if (info._id) {
      Order.find({
        _id: info._id
      }, function (err, doc) {
        if (doc.length > 0) {
          res.json({
            rows: doc,
            total: doc.length
          })
        } else {
          res.json({
            flag: false,
            data: '没有找到相关信息'
          })
        }
      })
    } else {
      var query = Order.find({
        hotel_username: decode.username
      }).skip((info.pageNum - 1) * info.pageSize);
      query.limit(info.pageSize);
      if (info.nationality >= 0) {
        query.where('nationality', info.nationality);
      }
      query.exec(function (err, rs) {
        if (info.nationality >= 0) {
          if (info.room_type_name) {
            Order.find({
              nationality: info.nationality,
              room_type_name: info.room_type_name,
              hotel_username: decode.username
            }, function (err, doc) {
              console.log(doc);
              res.json({
                data: {
                  rows: doc,
                  total: doc.length
                }
              })
            })
          } else {
            Order.find({
              nationality: info.nationality,
              hotel_username: decode.username
            }, function (err, doc) {
              console.log(doc);
              res.json({
                data: {
                  rows: doc,
                  total: doc.length
                }
              })
            })
          }

        } else {
          if (info.room_type_name) {
            Order.find({
              room_type_name: info.room_type_name,
              hotel_username: decode.username
            }, function (err, doc) {
              console.log(doc);
              res.json({
                data: {
                  rows: doc,
                  total: doc.length
                }
              })
            })
          } else {
            Order.find({
              hotel_username: decode.username
            }, function (err, doc) {
              console.log(doc);
              res.json({
                data: {
                  rows: rs,
                  total: doc.length
                }
              })
            })
          }

        }
      })
    }
  })
})

router.post('/checkout', function (req, res) {
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    var info = {
      house_num: req.body.houseNum,
      begin_date: req.body.beginDate,
      hotel_username: decode.username
    }
    Order.findOne(info, function (err, doc) {
      doc.fin = true;
      doc.save();
      res.json({
        message: '退房成功'
      })
    })
  })
})

router.post('/orderdata', function (req, res) {
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    Order.find({
      hotel_username: decode.username
    }, function (err, doc) {
      res.json({
        data: {
          total: doc.length,
          order: doc
        }
      })
    })
  })
})

router.post('/weekdata', function (req, res) {
  var data = [];
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    Order.find({
      hotel_username: decode.username,
      begin_date: {
        $gte: moment().subtract(7, 'days').format('YYYY-MM-DD'),
        $lte: moment().format('YYYY-MM-DD')
      }
    }, function (err, doc) {
      if (doc.length > 0) {
        for (let i = 7; i > 0; i--) {
          var obj = new Object();
          obj.date = moment().subtract(i, 'days').format("YYYY-MM-DD");
          
          obj.data = doc.filter(item => moment(item.begin_date).format('YYYY-MM-DD') == obj.date).map(item => item).length;
         
          data.push(obj);
        }
        res.json({
          flag: true,
          data: data
        })
      } else {
        res.json({
          flag: false,
          data: '没有数据'
        })
      }
    })
  })
})

router.post('/status',function(req,res){
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    var info = {
      house_num: req.body.house_num,
      username: decode.username
    };
    RoomList.find(info,function(err,doc){
      doc.house_status = 2
      doc.save();
      res.json({
        message: '修改成功'
      })
    })
  })
})


module.exports = router;