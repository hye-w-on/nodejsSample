var http = require('http');
var cookie = require('cookie');
http.createServer(function(request, response){

    console.log(request.headers.cookie);
    var cookies = {};
    if(request.headers.cookie !== undefined){
        cookies = cookie.parse(request.headers.cookie);
    }
    console.log(cookies.yummy_cookie);

     response.writeHead(200, {
        'Set-Cookie':['yummy_cookie=choco', 
                        'tasty_cookie=strawberry',
                        `PermanentTest=hell; Max-Age=${60*60}`,
                        'SecureTest=hell; Secure',
                        'HttpOnlyTest=hell; HttpOnly',
                        'PathTest=hell; Path=/cookie']
     });
    response.end('Cookie!!');
}).listen(3000);

