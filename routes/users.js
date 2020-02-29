var express = require('express');
var router = express.Router();
var dbs = require('../lib/db.js')
var fs = require('fs')
var formidable = require('formidable');
var comm = require('../lib/comm.js')
var codeNum
var mobile

// 发送验证码 
router.get('/getCode', function(req, res, next) {
    mobile = req.query.mobile
    var code = ''
    dbs('find','users',{mobile:mobile},((data)=>{
      if(data.length > 0){
        res.status(202).send({err:'该手机号已注册'});
      }else{
        for (let i = 0; i < 4; i++) {
          code += Math.floor(Math.random()*10).toString()
        }
        codeNum = code
        res.status(200).send(code);
      }
    }))
});

// 验证验证码
router.post('/testCode', (req, res)=>{
  if(mobile == req.body.mobile && codeNum == req.body.code){
    res.status(200).send({success:'验证通过'})
  }else{
    // morgan('aaaaaa')
    res.status(202).send({err:'验证失败'})
  }
})

// 用户注册
router.post('/register', (req, res)=>{
  req.body.addTime = comm.getTimeStr(new Date())
  req.body.updateTime = comm.getTimeStr(new Date())
  req.body.flag = 0
  dbs('add','users',req.body,((data)=>{
    if(data.result.n != 1){
      res.status(202).send({err:'注册失败'})
    }else{
      res.status(200).send({success:'注册成功'})
    }
  }))
})

// 用户登陆
router.post('/login', (req, res)=>{
  var mobile = req.body.mobile
  var password = req.body.password
  dbs('find','users',{mobile:mobile, password:password},((data)=>{
    if(data.length > 0){
      let resboj = {
        nickname: data[0].nickname,
        mobile: data[0].mobile,
        userid: data[0]._id
      }
      dbs('find','userPhotos',{userid: String(data[0]._id)},((picData)=>{
        if(picData.length>0){
          resboj.userImg = picData[picData.length-1].contents
        }else{
          resboj.userImg = ''
        }
        res.status(200).send({success:'登陆成功',data:resboj})
      }))
    }else{
      res.status(202).send({err:'登陆失败'})
    }
  }))
})

//获取用户头像
router.get('/getUserPhoto',(req, res)=>{
  dbs('find','userPhotos',{userid: String(req.query.userid)},((data)=>{
    if(data.length > 0 && data[0].contents){
      res.status(200).send({success:'头像获取成功',data:data[data.length-1].contents})
    }else{
      res.status(202).send({err:'头像获取失败'})
    }
  }))
})

// 修改头像
router.post('/updateUserPhoto',(req, res)=>{
  var form = new formidable.IncomingForm();//创建Formidable.IncomingForm对象
  form.encoding = 'utf-8';//设置表单域的编码
  form.uploadDir = "uploadFiles/userPhotos/";// 设置上传文件存放的文件夹
  form.keepExtensions = true;// 设置该属性为true可以使得上传的文件保持原来的文件的扩展名
  form.maxFieldsSize = 2 * 1024 * 1024;// 限制所有存储表单字段域的大小（除去file字段），如果超出，则会触发error事件，默认为2M
  form.maxFields = 1000;// 设置可以转换多少查询字符串，默认为1000

  form.parse(req, function(error, fileIds, files){
    //生成封面图片在数据库中的索引
    var pathName = comm.generateCode() + 'pic'
    //读取暂存文件生成16进制的流
    var readableStream = fs.createReadStream(files[Object.getOwnPropertyNames(files)[0]].path);
    var chunks = [];
    var size = 0;
    readableStream.on('data', function (chunk) {
        chunks.push(chunk);
        size += chunk.length;
    });

    readableStream.on('end', function () {
      var buf = Buffer.concat(chunks, size);
      console.log("fileIds",fileIds);
      var pictures = {
          pathName: pathName,
          userid: fileIds.userid,
          contents: buf
      }
      console.log("pictures",pictures);
      
      //将图片流存入userPhotos变并删除暂存文件
      dbs("add", "userPhotos", pictures, function (data) {
        console.log("data",data);
        
          if (data.length == 0) {
              res.end('{"err":"抱歉，上传图片失败"}');
          } else {
              fs.unlink(files[Object.getOwnPropertyNames(files)[0]].path, function (err) {
                  if (err) return console.log(err);
              })
              var target = files[Object.getOwnPropertyNames(files)[0]].path.split('.');
              if (target[target.length - 1] == 'jpg' || target[target.length - 1] == 'png' || target[target.length - 1] == 'gif' || target[target.length - 1] == 'jpeg') {
                  var obj = {
                      cacheName: '/DownLoadPicHandler?pathName=' + pathName,
                      success: "成功"
                  }
                  var str = JSON.stringify(obj);
                  res.end(str);
              } else {
                  var obj = {
                      cacheName: '/DownLoadPicHandler?pathName=' + pathName,
                      err: "失败"
                  }
                  var str = JSON.stringify(obj);
                  res.end(str);
              }
          }
      });
      
    });
  })
})


module.exports = router;
