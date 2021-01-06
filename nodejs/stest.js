var express = require('express')
var parseurl = require('parseurl')
var session = require('express-session')

var app = express()
var FileStore = require('session-file-store')(session);


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store:new FileStore()//sessions라는 디렉토리가 생김
}))


app.get('/', function (req, res, next) {
  console.log(req.session);
  res.send('you');
})

app.listen(3000, function(){
  console.log('3000!');
});