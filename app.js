var express = require('express');
var path = require('path');
//var cookieParser = require('cookie-parser');
var logger = require('morgan');

var apiRoute = require('./routes/api');
var downloadRoute = require('./routes/download');

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.engine('art', require('express-art-template'));

app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: false,limit: '50mb' }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static',express.static(path.join(__dirname,'static')));

app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("Server",'API');
    next();
});
app.use('/api', apiRoute);
app.use('/download',downloadRoute);

module.exports = app;
