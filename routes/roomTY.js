var express = require('express');
var router = express.Router();
var TypeOfRoom = require('../models/typeOfRoom');
var RoomList = require('../models/roomList');
var jwt = require('jsonwebtoken');
var multiparty = require('multiparty');
var fs = require('fs');
var moment = require('moment');

/* GET users listing. */
router.post('/upload', function (req, res) {
  var form = new multiparty.Form({
    uploadDir: './public/photos/'
  });
  form.parse(req, function (err, fields, files) {
    if (err) {
      console.log('parse error: ' + err);
    } else {
      console.log(files);
      var inputFile = files.img[0];
      var uploadedPath = inputFile.path;
      var filename = uploadedPath.split('//')
      inputFile.originalFilename = uploadedPath.split('\\')[2]
      var dstPath = '/photos/' + inputFile.originalFilename;
      res.json({
        path: dstPath
      })
    }
  });
})
//添加或修改房型信息
router.post('/roomTYinfo', function (req, res) {
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    if (err) {
      console.log(err)
    } else {  
      var roomTYInfo = {
        username: decode.username,
        _id:req.body._id,
        room_type_name: req.body.room_type_name,
        room_type_flag: req.body.room_type_flag,
        room_type_price: req.body.room_type_price,
        room_num: req.body.room_num,
        room_area: req.body.room_area,
        breakfeast: req.body.breakfeast,
        pic: req.body.pic,
        bed_type: req.body.bed_type
      }
      if (req.body._id == 0) {
        var monInsert = new TypeOfRoom({
          username: roomTYInfo.username,
          room_type_name: roomTYInfo.room_type_name,
          room_type_flag: roomTYInfo.room_type_flag,
          room_type_price: roomTYInfo.room_type_price,
          room_num: roomTYInfo.room_num,
          room_area: roomTYInfo.room_area,
          breakfeast: roomTYInfo.breakfeast,
          pic: roomTYInfo.pic,
          bed_type: roomTYInfo.bed_type
        });
        monInsert.save(function (er) {
          if (er) {
            console.log(er);
          } else {
            res.json({
              code: 200,
              message: '添加成功'
            })
          }
        })
      } else {
        TypeOfRoom.findOne({
          _id: roomTYInfo._id
        }, function (err, doc) {
          if (err) {
            console.log(err);
          } else {
            console.log(doc)
            doc.room_area = roomTYInfo.room_area 
            doc.room_type_name=roomTYInfo.room_type_name;
            doc.room_type_flag = roomTYInfo.room_type_flag;
            doc.room_type_price = roomTYInfo.room_type_price;
            doc.room_num = roomTYInfo.room_num;
            doc.pic = roomTYInfo.pic;
            doc.bed_type = roomTYInfo.bed_type;
            doc.breakfeast = roomTYInfo.breakfeast
            doc.save();
            res.json({
              message: '修改成功'
            })
          }
        })
      }
    }
  })
})
//获取全部的房间类型信息
router.post('/getRoomAll',function(req,res){
  jwt.verify(req.cookies.token,global.secret,function(err,decode){
    if(err){
      console.log(err)
    }else{
      var searchInfo = {
        keys: req.body.keys,
        status: req.body.status
      }
      var reg = new RegExp(searchInfo.keys,'i');
      if(!searchInfo.keys){
        if(searchInfo.status.length == 0 || searchInfo.status.length==3){
          TypeOfRoom.find({
            username: decode.username
          }, function (err, doc) {
            if (err) {
              console.log(err)
            } else {
              if (doc.length != 0) {
                res.json({
                  flag: true,
                  data: doc
                })
              } else {
                res.json({
                  flag: false,
                  data: '没有相关信息'
                })
              }
            }
          })
        }else{
          switch (searchInfo.status.length) {
            case 1:
              TypeOfRoom.find({ 
                username: decode.username, 
                room_type_flag: searchInfo.status[0] }, function (err, doc) {
                if (err) {
                  console.log(err);
                } else {
                  res.json({
                    flag: true,
                    data: doc
                  })
                }
              })
              break;
            case 2:
            console.log(2)
              TypeOfRoom.find(
                {
                  username: decode.username,
                  $or: [{
                    room_type_flag: searchInfo.status[0]
                  }, {
                    room_type_flag: searchInfo.status[1]
                  }]
                }, function (err, doc) {
                  if (err) {
                    console.log(err);
                  } else {
                    res.json({
                       flag: true,
                      data: doc
                    })
                  }
                })
              break;
          }
        }
      }else{
        if(searchInfo.status.length == 0 || searchInfo.status.length==3){
          TypeOfRoom.find({
            username: decode.username,
            room_type_name: { $regex: reg },
          },function(err,doc){
            if(err){
              console.log(err)
            }else{
              res.json({
                 flag: true,
                data:doc
              })
            }
          })
        }else{
          switch (searchInfo.status.length) {
            case 1:
              TypeOfRoom.find({ 
                username: decode.username, 
                room_type_name: {$regex:reg},
                room_type_flag: searchInfo.status[0] 
              }, function (err, doc) {
                if (err) {
                  console.log(err);
                } else {
                  res.json({
                     flag: true,
                    data: doc
                  })
                }
              })
              break;
            case 2:
              TypeOfRoom.find(
                {
                  username: decode.username,
                  room_type_name: { $regex: reg },
                  $or:[{
                    room_type_flag: searchInfo.status[0]
                  },{
                      room_type_flag: searchInfo.status[1]
                  }]
                }, function (err, doc) {
                  if (err) {
                    console.log(err);
                  } else {
                    res.json({
                       flag: true,
                      data: doc
                    })
                  }
                })
              break;
          }
        }
      }
    }
  })
})

router.post('/isldle',function(req,res){
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    if (err) {
      console.log(err)
    } else {
      TypeOfRoom.find({
        username: decode.username,
        room_type_flag: 1
      },function(err,doc){
        var data = [];
        for(var i=0;i<doc.length;i++){
          var obj = new Object();
          obj.house_type_name = doc[i].room_type_name;
          data.push(obj);
        }
        RoomList.find({$or:data},function(err,doc){
          for(let i=0;i<data.length;i++){
            var roomArr = doc.filter(item => item.house_status == 3&& item.house_type_name==data[i].house_type_name);
            if(roomArr.length>0){
              data[i].flag = true;
            }else{
              data[i].flag = false;
            }
          }
          res.json({
            data: data
          })
        })
      })
    }
  })
})


//上下架
router.post('/roomStatus',function(req,res){
  jwt.verify(req.cookies.token,global.secret,function (err,decode) {
    if(err){
      console.log(err)
    }else{
      console.log(req.body._id)
      TypeOfRoom.findOne({_id:req.body._id},function(err,doc){
        if(err){
          console.log(err);
        }else{
          if(doc.room_type_flag == 0 || doc.room_type_flag == 2){
            doc.room_type_flag = 1;
            doc.save();
            res.json({
              message: "修改成功"
            })
          }else{
            doc.room_type_flag = 2;
            doc.save();
            res.json({
              message: "修改成功"
            })
          }
        }
      })
    }
  })
})

router.post('/del',function(req,res){
   jwt.verify(req.cookies.token, global.secret, function (err, decode) {
     if (err) {
       console.log(err)
     } else {
       console.log(req.body._id)
       TypeOfRoom.remove({
         _id: req.body._id
       }, function (err) {
         if (err) {
           console.log(err);
         } else {
           console.log(2)
           res.json({
             message: '删除'
           })
         }
       })
     }
   })
})

module.exports = router;