var express = require('express');
var parser = require('body-parser');
var app = express();
var mysql = require('mysql');
var multer = require('multer');
var fs=require('fs');
var path = require("path");
var router = express.Router();
// 开启服务器
var server = app.listen(8080, function () {
  console.log('Server running at http://127.0.0.1:8080/');
})
// 创建数据库连接
var connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    //  password:"",
    database:"paper_manager",
    port:3306
  
});

//数据库连接
connection.connect();
//可以请求public 里面的静态资源
app.use('/public/',express.static('./public/'));
//配置使用art-template 模板引擎
app.engine('html', require('express-art-template'));

app.get('/',function (req,res) {
   res.render('login.html');
})


//接收post请求
   //设置用户全局变量
var username;
var password;
  app.post('/login',parser.urlencoded({extended:false}),function (req,res) {
    // console.log(req.body);
    
  //接收传输过来的邮箱和密码
     username = req.body.username;
     password = req.body.password;
    // console.log(username+":"+password);
    var sql = "SELECT password FROM user where username = '" + username+"'" ;
   
  //开始查询
     connection.query(sql, function (err,rows,result) {
      if(err){
        var a = err.message;
        console.log("查询错误："+a);
      }else{
       var passwd=rows[0]['password'];
       
       if(passwd==password){
        //查询该username 在表paper_resourse 中的所有数据
       
        var sql2= "select * from paper_resource where owner='"+username+"'";
        connection.query(sql2,function (err,rows,result) {
           if(err){
            var a = err.message;
            console.log("查询错误："+a);
           }else{
                  var lists =[ {
                        }] ;
                      
                  for (let index = 0; index < rows.length; index++) {
                       var list = req.query;
                    list.papername=rows[index]['papername'];
                     list.paperstate=rows[index]['state'];
                     list.num=rows[index]['papernum'];
                     lists.unshift({
                      papername:list.papername,
                      paperstate:list.state,
                      num:list.num
                     });       
                   
                  }
                 
                  //重定向
                 
              
                  res.render('main.html',{
                     comments:lists
                  });
                 
                  
         }
        })
        
       }else{
         res.render('404.html')
       }
      }
      
    });

  })
  // 点击上传按钮，跳至upload 上传文件页面
  app.post('/uploadfile',function (req,res) {
    res.render('upload.html');
  })
//接收由表单上传的文件
  app.post('/fileupload',multer({
    //设置文件存储路径
   dest: 'upload'   //upload文件如果不存在则会自己创建一个。
}).single('file'), function (req, res, next) {
  if (req.file.length === 0) {  //判断一下文件是否存在
      res.render("error", {message: "上传文件不能为空！"});
      return
  } else {
     let file = req.file;
    var filename= file.originalname;
    fs.renameSync('./upload/' + file.filename, './upload/' + file.originalname);//这里修改文件名字，比较随意。
    // 获取文件信息
    var sql3 = "insert into paper_resource(papername,state,papernum,owner) values('"+filename+"','未打印',50,'"+username+"')";

    connection.query(sql3,function (err,rows,result) {
      if(err){
        console.log(err);
        return;
      }else{
       console.log("数据添加成功");
     
      }
    })
     // 设置响应类型及编码
     res.set({
       'content-type': 'application/json; charset=utf-8'
    });

    //  res.end("上传成功！");
  }
});

