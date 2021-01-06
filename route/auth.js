/*------------------------
  Express
  ------------------------*/

var express = require('express');
var router = express.Router();

var template = require('../lib/template.js');

var authData = {
  email: 'egoing777@gmail.com',
  password: '1111',
  nickname: 'egoing'
}

router.get('/login', function(request, response){
  var title = 'WEB - login';
  //var list = template.list(request.list);
  var body = `<form action="/auth/login_process" method="post">
              <p><input type="text" name="email"></p>
              <p><input type="password" name="pwd"></p>
              <p><input type="submit" value="login"></p>
            </form>`;
  var html = template.html(title, '', body, '');
  response.send(html);
});

router.post('/login_process', function (request, response) {
  var post = request.body;
  console.log(post);
  var email = post.email;
  var password = post.pwd;
  console.log(post);
  if(email === authData.email && password === authData.password){
    request.session.is_logined = true;
    request.session.nickname = authData.nickname;
    request.session.save(function(){
      response.redirect(`/`);
    });
  } else {
    response.send('Who?');
  }
  // response.redirect(`/topic/${title}`);
});

router.get('/logout', function (request, response) {
  request.session.destroy(function(err){
    response.redirect('/');
  });
});

module.exports = router; //모듈로 사용하기 위해 필수