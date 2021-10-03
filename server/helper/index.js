const moment = require('moment');

const NodeCache = require( "node-cache" );

let helper = {
    apiMsg : function(code ,msg , data){
        if (code === undefined) code = 0;
        if (msg === undefined) msg = '';
        if (data === undefined) data = null;

        return {
            code : code,
            msg : msg,
            data : data,
        }
    },

    successMsg : function (data, msg, code) {
        if (msg === undefined) msg = 'success';

        return helper.apiMsg(code,msg,data);
    },

    failMsg : function (msg, code, data) {
        if (code === undefined) code = 99999;
        if (msg === undefined) msg = 'error';

        return helper.apiMsg(code,msg,data);
    },

    getRootPath : function (path) {
        if(path === undefined){
            path = '';
        }else{
            path = '/' + path;
        }
        
        return __dirname + '/../..' + path;
    },
    
    getPdfPath : function (path) {
        if(path === undefined){
            path = '';
        }else{
            path = '/' + path;
        }

        return __dirname + '/../../public/pdf' + path;
    },
    
    log : function (msg) {
        console.log('[' + moment().format() + '] ' + msg)
    },
    info : function (msg) {
        console.info('[' +  moment().format() + '] ' + msg)
    },
    error : function (msg) {
        console.error('[' +  moment().format() + '] ' + msg)
    },
    
    stringToDataUrl : function (text,type) {
        type = type || 'text/html';
        return 'data:' + type + ';base64,' + Buffer.from(text).toString('base64');
    }
};

helper.cache = new NodeCache({ stdTTL: 100 });

module.exports = helper;
