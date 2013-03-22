/**
 * Created with JetBrains WebStorm.
 * User: xiaochuan
 * Date: 13-3-22
 * Time: 上午9:21
 * To change this template use File | Settings | File Templates.
 */



var http = require('http');
var url = require('url');


http.createServer(function(req,res){
    var theUrl = url.parse(req.url);
    console.log(theUrl);
    res.writeHead(200,{'Content-Type':'text/plain'});
    res.end();
}).listen(3000);