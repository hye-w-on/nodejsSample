var sanitizeHtml = require('sanitize-html');

module.exports = {
  html: function(title,list,body,controlMenu){
    return `
    <!doctype html>
    <html>
    <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
    </head>
    <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${controlMenu}
    ${body}
    </body>
    </html>
    `;
  },list: function(fileList){
    var list = '<ul>';
    var i = 0;
    while(i<fileList.length){
      list = list + `<li><a href="/?id=${fileList[i]}">${sanitizeHtml(fileList[i])}</a></li>`;
      //사용자가 입력가능하고 다시 사용자에게 html이 실행되어 보여지는 부분은 sanitize 보안처리 필요
      i = i + 1;
    }
    list = list + '</ul>';
    return list;
  },dbList: function(fileList){
    var list = '<ul>';
    var i = 0;
    while(i<fileList.length){
      list = list + `<li><a href="/?id=${fileList[i].id}">${sanitizeHtml(fileList[i].title)}</a></li>`;
    //사용자가 입력가능하고 다시 사용자에게 html이 실행되어 보여지는 부분은 sanitize 보안처리 필요
       i = i + 1;
    }
    list = list + '</ul>';
    return list;
  },authorSelect: function(authors, author_id){
    var tag = '';
    var i = 0;
    while(i < authors.length){
      var selected = '';
      if(authors[i].id === author_id) {//파라미터와 비교하여 같으면 선택
        selected = ' selected';
      }
      tag += `<option value="${authors[i].id}"${selected}>${authors[i].name}</option>`;
      i++;
    }
    return `
      <select name="author">
        ${tag}
      </select>
    `
  }
}
