
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
        console.log('[' + new Date() + '] ' + msg)
    },
    info : function (msg) {
        console.info('[' + new Date() + '] ' + msg)
    },
    error : function (msg) {
        console.error('[' + new Date() + '] ' + msg)
    },
};

module.exports = helper;
