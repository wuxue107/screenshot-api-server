const moment = require('moment');
const NodeCache = require( "node-cache" );
const stringRandom = require('string-random');
const pathModule = require('path');
const fs = require('fs');

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

    normalizePath : function(filePath){
        let reg = (pathModule.sep === '\\')? /\//g : /\\/g;
        return filePath.replace(reg,pathModule.sep);
    },
    
    getPublicPath : function (path) {
        if(path === undefined || path === '' || path === null){
            path = '';
        }else{
            if(path[0] !== '/'){
                path = '/' + path;
            }
        }
      
        return require('path').join(__dirname + '/../../public', path);
    },
    warn : function (msg) {
        console.warn('[' + moment().format() + '] WARN:' + msg)
    },
    log : function (msg) {
        console.log('[' + moment().format() + '] LOG:' + msg)
    },
    info : function (msg) {
        console.info('[' +  moment().format() + '] INFO:' + msg)
    },
    error : function (msg) {
        console.error('[' +  moment().format() + '] ERROR:' + msg)
    },
    
    stringToDataUrl : function (text,type) {
        type = type || 'text/html';
        return 'data:' + type + ';base64,' + Buffer.from(text).toString('base64');
    },
    
    getPdfDailyPathByTimestamp : function(timestamp){
        let date = moment(timestamp).format('YYYY-MM-DD');
        let relate = 'pdf/' + date;
        return helper.getPublicPath(relate);
    },
    
    makePdfFileInfo : function(){
        return helper.makeFileInfo('pdf','.pdf')
    },

    makeHtmlFileInfo : function(){
        return helper.makeFileInfo('html','.html')
    },

    makeFileInfo : function(subDir,suffix){
        let pdfFileName = stringRandom(20, { numbers: false }) + suffix;

        let date = moment(Date.now()).format('YYYY-MM-DD');
        let relate = subDir + '/' + date;
        let pdfDailyPath =  helper.getPublicPath(relate);
        if(!require('fs').existsSync(pdfDailyPath)){
            require('fs').mkdirSync(pdfDailyPath,{recursive:true})
        }

        return  {
            fullPath : pdfDailyPath + '/' + pdfFileName,
            relatePath : relate + '/' + pdfFileName,
        };
    },
    
    assertFileReadable : async function(filePath, error){
        return await new Promise( function (resolve, reject) {
            fs.access(filePath, fs.constants.R_OK, async function (err) {
                if (err) {
                    reject(error + ":" + err);
                    return;
                }
                
                resolve();
            });
        });
    },
    
    
    wait : async function(millisecond){
        return await new Promise(function(resolve){
            setTimeout(resolve,millisecond);
        });
    },

    /**
     * 间隔时间检查，直到检查函数返回非false/undefined值 或超时，终止检查
     * 
     * @param asyncCheckFun
     * @param delay
     * @param timeout
     * @param errorStop
     * @returns {Promise<any>}
     */
    intervalUntil : async function(asyncCheckFun,delay,timeout,errorStop){
        delay = ~~delay;
        if(delay < 10) delay  = 10;
        errorStop = !!errorStop;
        timeout = ~~ timeout;
        if(timeout <= 0) timeout = 30000;
        
        let endTime = (new Date()).getTime() + timeout;
        while(true){
            await helper.wait(delay);
            let v = await asyncCheckFun().catch(function (e) {
                //helper.warn("helper.intervalUntil asyncCheckFun error:" + e);
                if(errorStop){
                    throw e;
                }
            });
            
            if(v !== false && v !== undefined){
                return v;
            }

            if( (new Date()).getTime() > endTime){
                throw "intervalUntil timeout:" + timeout + "ms"
            }
        }
    },
};

helper.cache = new NodeCache({ stdTTL: 100 });

module.exports = helper;
