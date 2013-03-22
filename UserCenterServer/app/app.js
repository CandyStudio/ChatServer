/**
 * Created with JetBrains WebStorm.
 * User: xiaochuan
 * Date: 13-3-22
 * Time: 上午9:21
 * To change this template use File | Settings | File Templates.
 */



var express = require('express');
var http = require('http');
var app = express();

app.configure(function(){
    app.set('port', 3000);

    app.locals.pretty = true;

    app.use(express.bodyParser());
    app.use(express.methodOverride());
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

require('./router')(app);

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
})