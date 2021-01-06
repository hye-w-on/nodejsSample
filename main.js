var http = require('http');
//const fs = require('fs');
var url = require('url'); //url 모듈을 url이라는 변수명으로 사용하겠다
var qs = require('querystring');
var path = require('path');
var template = require('./lib/template.js');
var topic = require('./route/topic.js');

//express
var express = require('express');
var app2 = express();
var bodyParser = require('body-parser'); //request를 받아오는 코드를 간단히 하기 위해 필수 //var post = request.body;

var session = require('express-session');
var FileStore = require('session-file-store')(session); //세션을 파일에 저장하는 것보다는 DB등에 저장해야함

app2.use(session({ //세션설정
  secret: 'asadlfkj!@#!@#dfgasdg',
  resave: false,
  saveUninitialized: true,
  store:new FileStore()
}))

app2.use(express.static('public'));
app2.use(bodyParser.urlencoded({ extended: false }));

var authRouter = require('./route/auth');//Router
app2.use('/auth',authRouter);//express "/auth"라는 패스에 authRouter라는 미들웨어를 적용하겠다
app2.use(bodyParser.urlencoded({extended:true})); 
app2.use(bodyParser.json());

var app = http.createServer(function (request, response) {
  var _url = request.url; // Query String을 가져오는 부분
  //console.log(url.parse(_url, true));
  var urlParse = url.parse(_url, true);// url을 파싱
  var queryData = urlParse.query;
  var pathName = urlParse.pathname;

  if (pathName === '/') {
    if (queryData.id === undefined) { //Query String이 없으므로
      topic.home_db(request,response);
    } else {//상세보기 GET방식
      topic.detail_db(request,response);
    }
  } else if (pathName === '/create') { //신규 POST방식
    topic.create_db(request,response);
  } else if (pathName === '/process_create') { //form에서 전송된 데이터 처리
    topic.process_create_db(request,response);
  } else if (pathName === '/update') { //form에 수정을 위한 세팅
    topic.update_db(request,response);
  } else if (pathName === '/process_update') { //form에서 전송된 데이터 처리
    topic.process_update_db(request, response);
  } else if (pathName === '/process_delete') { //form에서 전송된 데이터 처리
    topic.process_delete_db(request, response);
  } else {
    response.writeHead(404);
    response.end('Not Found');
  }

});
app2.listen(3000); //3000 포트
//app.listen(3000); //3000 포트
