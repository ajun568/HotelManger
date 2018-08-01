var express = require('express');
var router = express.Router();
var RoomList = require('../models/roomList');
var TypeOfRoom = require('../models/typeOfRoom');
var jwt = require('jsonwebtoken');
var Order = require('../models/order');
var moment = require('moment')

/* GET users listing. */
router.post('/addhouse', function (req, res) {
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    if (err) {
      console.log(err);
    } else {
      var houseInfo = {
        _id: req.body.id,
        username: decode.username,
        house_type_id: req.body.house_type_id,
        house_num: req.body.house_num,
        floor: req.body.floor
      };
      console.log(houseInfo._id);
      TypeOfRoom.findOne({
        _id: houseInfo.house_type_id
      }, function (err, doc) {
        if (houseInfo._id) {
          RoomList.findOne({
            _id: houseInfo._id
          }, function (err, result) {
            if (result) {
              console.log(result.house_num)
              result.house_num = houseInfo.house_num;
              result.floor = houseInfo.floor;
              result.house_type_id = houseInfo.house_type_id;
              result.house_type_name = doc.room_type_name;
              result.save();
              res.json({
                flag: true,
                message: '修改成功'
              })
            }
          })
        } else {
          var room = new RoomList({
            username: houseInfo.username,
            house_type_name: doc.room_type_name,
            house_type_id: req.body.house_type_id,
            house_num: req.body.house_num,
            floor: req.body.floor
          });
          RoomList.findOne({
            house_num: req.body.house_num,
            username: decode.username
          }, function (err, doc) {
            console.log(doc);
            if (err) {
              console.log(err)
            } else {
              if (doc) {
                res.json({
                  flag: false,
                  message: '房间编号重复'
                })
              } else {
                room.save();
                res.json({
                  flag: true,
                  message: '添加成功'
                })
              }
            }
          })
        }
      })
    }
  })
})

router.post('/addhousebatch', function (req, res) {
  var failArr = [];
  var dataArr = [];
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    if (err) {
      console.log(err);
    } else {
      var houseInfo = {
        username: decode.username,
        house_type_id: req.body.house_type_id,
        house_num: req.body.house_arr,
        floor: req.body.floor
      };
      for (var i = 0; i < houseInfo.house_num.length; i++) {
        var obj = new Object();
        obj.house_num = houseInfo.house_num[i];
        dataArr.push(obj);
      }
      TypeOfRoom.findOne({
        _id: houseInfo.house_type_id
      }, function (err, rs) {
        RoomList.find({
          $or: dataArr,
          username:decode.username
        }, function (err, doc) {
          if (err) {
            console.log(err)
          } else {
            if (doc.length > 0) {
              console.log(doc)
              for (var i = 0; i < houseInfo.house_num.length; i++) {
                var data = doc.filter(item => item.house_num == houseInfo.house_num[i]).map(item => item);
                if (data.length > 0) {
                  failArr.push(data[0].house_num);
                } else {
                  var room = new RoomList({
                    username: houseInfo.username,
                    house_type_id: houseInfo.house_type_id,
                    house_num: houseInfo.house_num[i],
                    floor: houseInfo.floor,
                    house_type_name: rs.room_type_name
                  });
                  room.save();
                }
              }
            } else {
              for (var i = 0; i < houseInfo.house_num.length; i++) {
                var room = new RoomList({
                  username: houseInfo.username,
                  house_type_id: houseInfo.house_type_id,
                  house_num: houseInfo.house_num[i],
                  floor: houseInfo.floor,
                  house_type_name: rs.room_type_name
                });
                room.save();
              }
            }
            if (failArr.length == 0) {
              res.json({
                flag: true,
                mesaage: '全部添加成功'
              })
            } else {
              res.json({
                flag: false,
                failArr: failArr,
                message: '未设置的房间添加成功'
              })
            }
          }
        })
      })
    }
  })
})

router.post('/gethouse', function (req, res) {
  var roomTyofId = [];
  var roomTypeName = [];
  var order = new Object();
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    if (err) {
      console.log(err);
    } else {
      TypeOfRoom.find({
        username: decode.username,
        room_type_flag: 1
      }, function (err, doc) {
        if (err) {
          console.log(err)
        } else {
          if (doc.length == 0) {
            res.json({
              flag: false,
              data: '没有相关信息'
            })
          } else {
            for (var i = 0; i < doc.length; i++) {
              var idObj = new Object();
              var nameObj = new Object();
              idObj.house_type_id = doc[i]._id;
              nameObj.room_type_name = doc[i].room_type_name;
              nameObj.price = doc[i].room_type_price
              roomTyofId.push(idObj);
              roomTypeName.push(nameObj)
            }
            RoomList.find({
              $or: roomTyofId
            }).sort({
              "house_num": 1
            }).exec(function (err, rs) {
              if (err) {
                console.log(err)
              } else {
                if (rs.length > 0) {
                  Order.find({
                    hotel_username: decode.username,
                    $and: [{
                      begin_date: {
                        $gte: moment().subtract(30, 'days').format('YYYY-MM-DD')
                      },
                    }, {
                      end_date: {
                        $lte: moment().add(30,'days').format('YYYY-MM-DD'),
                      }
                    }]
                  }, function (err, doc) {
                    console.log(doc);
                    var houseData = [];
                    for (var i = 0; i < roomTyofId.length; i++) {
                      var dataObj = new Object();
                      var data = [];
                      dataObj.roomTypeName = roomTypeName[i].room_type_name;
                      dataObj.price = roomTypeName[i].price
                      dataObj.data = rs.filter(item => String(item.house_type_id) == String(roomTyofId[i].house_type_id)).map(item => {
                      var orderarr = doc.filter(i => i.house_num == item.house_num && i.fin == false).map(i => {
                          if (i.order == 0) {
                            item.house_status = 2
                          } else if (i.order == 1) {
                            item.house_status = 1;
                          } else {
                            item.house_status = 3
                          }
                          return i;
                        });
                        if(orderarr.length>0){
                        item.order = JSON.parse(JSON.stringify(orderarr[0]));
                        }
                        return item;
                      });
                      houseData.push(dataObj);
                    }
                    res.json({
                      flag: true,
                      data: houseData
                    });
                  })
                }
                else{
                  res.json({
                    flag: false,
                    message: '没有相关信息'
                  })
                }
              }
            });
          }
        }
      });
    }
  })
})

router.post('/getfloor', function (req, res) {
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    RoomList.find({
      username: decode.username
    }, function (err, doc) {

      var data = Array.from(new Set(doc.map(item => item.floor)));
      console.log(data);
      data.sort(function (a,b) {
        return a-b;
      })
      res.json({
        floor: data
      })
    })
  })
})

router.post('/pagelist', function (req, res) {
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    var info = {
      pageNum: req.body.pageNum, //当前页码
      pageSize: req.body.pageSize, ///每页数量
      username: decode.username,
      floor: req.body.floor
    };
    var query = RoomList.find({
      username: decode.username
    }).sort({
      'house_num':1
    });
    query.skip((info.pageNum - 1) * info.pageSize);
    query.limit(info.pageSize);
    if (info.floor != 0) {
      query.where('floor', info.floor);
    }
    query.exec(function (err, rs) {
      if (err) {
        res.send(err)
      } else {
        if (info.floor != 0) {
          RoomList.find({
            floor: info.floor,
            username: decode.username
          }, function (err, doc) {
            res.json({
              data: {
                rows: rs,
                total: doc.length
              }
            })
          })
        } else {
          RoomList.find({
            username: decode.username
          }, function (err, doc) {
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
  })
})

router.post('/delhouse', function (req, res) {
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    if (err) {
      res.send(err);
    } else {
      console.log(req.body.id);
      RoomList.remove({
        _id: req.body.id
      }, function (err, doc) {
        if (err) {
          res.send(err);
        } else {
          res.json({
            message: '删除成功'
          })
        }
      })
    }
  })
})

router.post('/gethouseinfo', function (req, res) {
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    if (err) {
      res.send(err);
    } else {
      RoomList.findOne({
        _id: req.body.id
      }, function (err, doc) {
        if (err) {
          res.send(err);
        } else {
          res.json(doc);
        }
      })
    }
  })
})

module.exports = router;