var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var Client = require('../models/client')

/* GET users listing. */
router.post('/addinfo', function (req, res) {
  var clientInfo = {
    b_username: req.body.b_username,
    client_username: req.body.userName,
    client_name: req.body.name,
    idcard: req.body.idCard,
    nationality: req.body.nationality,
    avatar: req.body.avatar
  };
  console.log(clientInfo);
  if (req.body.national == 0) {
    Client.find({
      client_username: clientInfo.client_username
    }, function (err, doc) {
      if (doc.length == 0) {
        var mongoInsert = new Client(clientInfo);
        mongoInsert.save();
        res.json({
          message: '添加成功'
        })
      } else {
        res.json({
          message: '添加失败'
        })
      }
    })
  } else {
    clientInfo.country = req.body.country;
    clientInfo.time = req.body.time;
    clientInfo.todo = req.body.todo;
    clientInfo.job = req.body.job;
    console.log(clientInfo);
    Client.find({
      client_username: clientInfo.client_username
    }, function (err, doc) {
      if (doc.length == 0) {
        var mongoInsert = new Client(clientInfo);
        mongoInsert.save();
        res.json({
          message: '添加成功'
        })
      } else {
        res.json({
          message: '添加失败'
        })
      }
    })
  }
})

router.post('/getInfo', function (req, res) {
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    Client.find({
      b_username: decode.username
    }, function (err, doc) {
      if (err) {
        res.send(err)
      } else {
        res.json({
          data: doc
        })
      }
    })
  })
})

router.post('/disable', function (req, res) {
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    if (err) {
      res.send(err);
    } else {
      Client.findOne({
        _id: req.body.id
      }, function (err, doc) {
        if (doc.disable == 0) {
          doc.disable = 1;
          doc.save();
        } else {
          doc.disable = 0;
          doc.save()
        }
      });
      res.json({
        message: '修改成功'
      })
    }
  })
})

module.exports = router;