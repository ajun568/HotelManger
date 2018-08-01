var express = require('express');
var router = express.Router();
var User = require('../models/user');
var jwt = require('jsonwebtoken');

/* GET users listing. */
router.post('/register', function(req, res) { 
    var userInfo = {
      username: req.body.username,
      password: req.body.password,
    }
    console.log(userInfo);
    User.find({ username: req.body.username},function (err,doc) {
      if(err){
        console.log(err)
      }else{
        if(doc.length !== 0){
          res.json({
            code: 200,
            flag: false,
            message: '账号已存在'
          })
        }else{
          var monInsert = new User(userInfo);
          monInsert.save(function (er) {
            if (er) {
              console.log(er);
            } else {
              res.json({
                code: 200,
                flag: true,
                message: '注册成功'
              })
            }
          })
        }
      }
    })
});

router.post('/login', function (req,res){
  var userInfo = {
    username: req.body.username,
    password: req.body.password
  };
  console.log(userInfo)
  User.findOne(userInfo, function (err, doc) {
    if (err) {
      console.log(err)
    } else {
      console.log(doc)
      if (doc) {
        var token = jwt.sign(userInfo, global.secret, {
          expiresIn: 60 * 60 *24
        })
        res.cookie('token',token,{
          httpOnly: true,
          maxAge: 600000000
        })
        res.json({
          code: '200',
          fir_flag: doc.fir_flag,
          flag: true,
          token: token,
          username: userInfo.username,
          message: '登陆成功'
        });
      } else {
        res.json({
          code: '200',
          flag: false,
          message: '账号密码不正确'
        });
      }
    }
  });
});

router.post('/addUserInfo',function (req,res) {
  var userInfo = {
    name: req.body.name,
    term: req.body.term,
    phone: req.body.phone,
    region: req.body.region,
    address: req.body.address,
    fir_flag: true,
    avatar: req.body.avatar,
 
  };
  jwt.verify(req.cookies.token, global.secret, function (err, decode) {
    if(err){
     console.log(err);
      res.json({
        code: 200,
        message: '失败'
      })
    }else{
      console.log(decode);
      User.findOne({username:decode.username},function(err,doc){
        doc.name = userInfo.name;
        doc.term = userInfo.term;
        doc.phone = userInfo.phone;
        doc.region = userInfo.region;
        doc.address = userInfo.address;
        doc.fir_flag = userInfo.fir_flag;
        doc.avatar = userInfo.avatar;
       
        doc.save();
      })
      res.json({
        code: 200,
        message: '设置成功'
      })
    }
  })
 
});

router.post('/getInfo',function (req,res) {
    jwt.verify(req.cookies.token, global.secret, function (err, decode) {
      if (err) {
        console.log(err);
      } else {
        var userInfo = {
          username: decode.username,
          password: decode.password
        }
        User.findOne(userInfo,function (err,doc) {
          res.json({
            code: 200,
            name: doc.name,
            term: doc.term,
            phone: doc.phone,
            region: doc.region,
            address: doc.address,
            fir_flag: doc.fir_flag,
            creat_time: doc.time,
            avatar: doc.avatar,
            date: doc.creat_time
          })
        })
      }
    })
});

module.exports = router;
