var express = require('express');
var path = require('path');
//var cookieParser = require('cookie-parser');
var logger = require('morgan');

var apiRoute = require('./routes/api');
var downloadRoute = require('./routes/download');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("screenshot-api-server",'1.0.0')
    next();
});
app.use('/api', apiRoute);
app.use('/download',downloadRoute)


module.exports = app;
