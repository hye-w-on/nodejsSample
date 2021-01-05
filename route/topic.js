var url = require('url'); //url 모듈을 url이라는 변수명으로 사용하겠다
var qs = require('querystring');
var template = require('../lib/template.js');
var db = require('../lib/dbConfig.js');
db.connect();

var sanitizeHtml = require('sanitize-html');

exports.home_db = function (request, response) {
    db.query('SELECT * from topic', function (error, results, fields) {
        if (error) throw error;
        var title = 'HOME MAIN';
        var data = 'TEXT SAMPLE';
        var list = template.dbList(results);
        var body = `<h2>${title}</h2><p>${data}</p>`;
        var controlMenu = `<a href="/create">create</a>`;
        var html = template.html(title, list, body, controlMenu);

        response.writeHead(200);
        response.end(html);
    });
}
exports.home_file = function (request, response) {
    fs.readdir(dataFolder, function (err, fileList) {
        var title = 'HOME MAIN';
        var data = 'TEXT SAMPLE';
        var list = template.list(fileList);
        var body = `<h2>${title}</h2><p>${data}</p>`;
        var controlMenu = `<a href="/create">create</a>`;
        var html = template.html(title, list, body, controlMenu);

        response.writeHead(200);
        response.end(html);
        //response.end(fs.readFileSync(__dirname + _url)); //경로를 만들어서 호출
        //response.end(이 부분이 화면에서 보인다);
        //__dirname : 현재 파일의 경로
    });
}
exports.detail_file = function (request, response) {
    var _url = request.url; // Query String을 가져오는 부분
    var urlParse = url.parse(_url, true);// url을 파싱
    var queryData = urlParse.query;
    var pathName = urlParse.pathname;
    var dataFolder = './dataFile';

    fs.readdir(dataFolder, function (err, fileList) {
        //파일 내용 읽기
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`${dataFolder}/${filteredId}`, 'utf8', function (err, data) {
            if (err) throw err;
            var title = queryData.id;
            var sanitizedTitle = sanitizeHtml(title); //태그를 제거
            var sanitizedData = sanitizeHtml(data, {
                allowedTags: ['h1']
            }); //h1 태그는 제거하지 않음
            var list = template.list(fileList);
            var body = `<h2>${sanitizedTitle}</h2><p>${sanitizedData}</p>`;
            var controlMenu = `<a href="/create">create</a>
            <a href="/update?id=${sanitizedTitle}">update</a>
            <form action="process_delete" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
            </form>
            `;
            var html = template.html(title, list, body, controlMenu);

            response.writeHead(200);
            response.end(html);
        });
    });
}
exports.detail_db = function (request, response) {
    var _url = request.url; // Query String을 가져오는 부분
    var urlParse = url.parse(_url, true);// url을 파싱
    var queryData = urlParse.query;
    var pathName = urlParse.pathname;

    db.query('SELECT * from topic', function (error, results, fields) {
        if (error) throw error;
        db.query('SELECT * from topic where id=?', [queryData.id], function (error2, result, fields) {
            if (error2) throw error2;
            var title = sanitizeHtml(result[0].title);
            var data = sanitizeHtml(result[0].description);

            var list = template.dbList(results);
            var body = `<h2>${title}</h2><p>${data}</p>`;
            var controlMenu = `<a href="/create">create</a>
      <a href="/update?id=${queryData.id}">update</a>
      <form action="process_delete" method="post">
      <input type="hidden" name="id" value="${queryData.id}">
      <input type="submit" value="delete">
      </form>
      `;
            var html = template.html(title, list, body, controlMenu);

            response.writeHead(200);
            response.end(html);
        });
    });
}

exports.create_file = function (request, response) {
    fs.readdir(dataFolder, function (err, fileList) {
        var title = 'Create';
        var list = template.list(fileList);
        var body = `<h2>${title}</h2>
      <form action="/process_create" method="post">
      <p><input type="text" name="title"></p>
      <p><textarea name="data"></textarea></p>
      <p><input type="submit"></p>
      </form>`;
        var controlMenu = ``;
        var html = template.html(title, list, body, controlMenu);

        response.writeHead(200);
        response.end(html);
    });
}

exports.create_db = function (request, response) {
    db.query('SELECT * from topic', function (error, results, fields) {
        if (error) throw error;
        var title = 'Create';
        var list = template.dbList(results);

        var body = `<h2>${title}</h2>
        <form action="/process_create" method="post">
        <p><input type="text" name="title"></p>
        <p><textarea name="data"></textarea></p>
        <p><input type="submit"></p>
        </form>`;
        var controlMenu = `<a href="/create">create</a>`;
        var html = template.html(title, list, body, controlMenu);

        response.writeHead(200);
        response.end(html);
    });
}

exports.process_create_file = function (request, response) {
    var body = '';
    request.on('data', function (data) { //전송되는 데이터가 많을 경우 끊어서 전송
        body = body + data;
    });
    request.on('end', function () {//전부 전송 받으면 마지막으로 호출됨
        var post = qs.parse(body); //전송 데이터 파싱
        var title = post.title;
        var data = post.data;
        fs.writeFile(`dataFile/${title}`, data, 'utf8', function (err) {//파일 쓰기
            response.writeHead(302, { Location: `/?id=${title}` }); //리다이렉션
            response.end();
        });
    });
}

exports.process_create_db = function (request, response) {
    var body = '';
    request.on('data', function (data) { //전송되는 데이터가 많을 경우 끊어서 전송
        body = body + data;
    });
    request.on('end', function () {//전부 전송 받으면 마지막으로 호출됨
        var post = qs.parse(body); //전송 데이터 파싱
        var title = post.title;
        var data = post.data;
        //db INSERT
        db.query(`
        INSERT INTO topic (title, description, created, author_id) 
          VALUES(?, ?, NOW(), ?)`,
            [title, data, 1],
            function (error, result) {
                if (error) throw error;
                console.log(result);
                response.writeHead(302, { Location: `/?id=${result.insertId}` });//insert후 리턴된 PRIMARY KEY의 값
                response.end();
            }
        )
    });
}

exports.update_file = function (request, response) {
    var _url = request.url; // Query String을 가져오는 부분
    var urlParse = url.parse(_url, true);// url을 파싱
    var queryData = urlParse.query;

    fs.readdir(dataFolder, function (err, fileList) {
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`dataFile/${filteredId}`, 'utf8', function (err, data) {
          if (err) throw err;
          var title = queryData.id;
          var list = template.list(fileList);
          var body = `<h2>${title}</h2>
          <form action="/process_update" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" value="${title}"></p>
          <p><textarea name="data">${data}</textarea></p>
          <p><input type="submit"></p>
          </form>`;
          var controlMenu = `<a href="/create">create</a><a href="/update?id=${title}">update</a>`;
          var html = template.html(title, list, body, controlMenu);
  
          response.writeHead(200);
          response.end(html);
        });
      });
}
exports.process_update_file = function (request, response) {
    var body = '';
    request.on('data', function (data) { //전송되는 데이터가 많을 경우 끊어서 전송
      body = body + data;
    });
    request.on('end', function () {//전부 전송 받으면 마지막으로 호출됨
      var post = qs.parse(body); //전송 데이터 파싱
      var id = post.id;
      var title = post.title;
      var data = post.data;
      fs.rename(`dataFile/${id}`, `dataFile/${title}`, function (err) {//파일 rename
        fs.writeFile(`dataFile/${title}`, data, 'utf8', function (err) {//파일 쓰기
          response.writeHead(302, { Location: `/?id=${title}` }); //리다이렉션
          response.end();
        });
      });
    });
}
exports.update_db = function (request, response) {
    var _url = request.url; // Query String을 가져오는 부분
    var urlParse = url.parse(_url, true);// url을 파싱
    var queryData = urlParse.query;

    db.query('SELECT * FROM topic', function(error, topicList){
        if(error) throw error;
        db.query(`SELECT * FROM topic WHERE id=?`,[queryData.id], function(error2, topic){
          if(error2) throw error2;
          db.query('SELECT * FROM author', function(error2, authors){
            var id = topic[0].id;
            var title = topic[0].title;
            var data = topic[0].description;
            var list = template.dbList(topicList);
            var body = `<h2>${title}</h2>
            <form action="/process_update" method="post">
            <input type="hidden" name="id" value="${id}">
            <p><input type="text" name="title" value="${title}"></p>
            <p><textarea name="data">${data}</textarea></p>
            <p>
            ${template.authorSelect(authors, topic[0].author_id)}
            </p>
            <p><input type="submit"></p>
            </form>`;
            var controlMenu = `<a href="/create">create</a><a href="/update?id=${id}">update</a>`;
            var html = template.html(title, list, body, controlMenu);

            response.writeHead(200);
            response.end(html);
          });
        });
      });
}
exports.process_update_db = function (request, response) {
    var body = '';
    request.on('data', function (data) { //전송되는 데이터가 많을 경우 끊어서 전송
      body = body + data;
    });
    request.on('end', function () {//전부 전송 받으면 마지막으로 호출됨
      var post = qs.parse(body); //전송 데이터 파싱
      var id = post.id;
      var title = post.title;
      var data = post.data;
      db.query('UPDATE topic SET title=?, description=?, author_id=? WHERE id=?'
      , [title, data, post.author, id], function(error, result){
        response.writeHead(302, {Location: `/?id=${id}`});
        response.end();
      })
    });
}
exports.process_delete_file = function (request, response) {
    var body = '';
    request.on('data', function (data) { //전송되는 데이터가 많을 경우 끊어서 전송
      body = body + data;
    });
    request.on('end', function () {//전부 전송 받으면 마지막으로 호출됨
      var post = qs.parse(body); //전송 데이터 파싱
      var id = post.id;
      var filteredId = path.parse(id).base;
      fs.unlink(`dataFile/${filteredId}`, function (err) {//파일 쓰기)
        response.writeHead(302, { Location: `/` }); //리다이렉션
        response.end();
      });
    });
}
exports.process_delete_db = function (request, response) {
    var body = '';
    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        db.query('DELETE FROM topic WHERE id = ?', [id], function(error, result){
          if(error){
            throw error;
          }
          response.writeHead(302, {Location: `/`});
          response.end();
        });
    });
}