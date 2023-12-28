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

var packageConfig = require('./package.json');
app.all('*', (req, res, next) => {
    Object.defineProperty(req, 'origin', {
        get: function () {
            var origin =  req.headers.origin;
            if (origin) {
                return origin
            }
            
            if(req.headers.referer){
                let matches = req.headers.referer.match("^\\w+:\\/\\/[^\\/\\?\\#]+");
                if(matches){
                    return matches[0];
                }
            }
            
            if(req.headers.host){
                return req.protocol + '://' + req.headers.host;
            }else{
                let matches = req.url.match("^\\w+:\\/\\/[^\\/\\?\\#]+");
                if(matches){
                    return matches[0];
                }
                
                return undefined;
            }
        }
    });
    
    res.setHeader('X-Powered-By', 'screen-api-server');
    res.setHeader("Server-Version",packageConfig.version);
    res.setHeader("Access-Control-Allow-Origin", req.origin);
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Max-Age", "86400");
    //res.setHeader("Access-Control-Allow-Credentials", "false");
    res.setHeader("A ccess-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    if (req.method.toLowerCase() === 'options') {
        res.sendStatus(200);  // 让options尝试请求快速结束
    } else {
        next();
    }
});

app.use('/api', apiRoute);
app.use('/download',downloadRoute);


module.exports = app;
