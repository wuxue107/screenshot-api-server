let helper = require('../helper/index');
let browserHelper = require('../puppeteer/index');
const stringRandom = require('string-random');
const _ = require('lodash');
const moment = require('moment');
const urlencode = require('urlencode');

const renderPdf = function(req, res, next) {
    let postParam = req.body;
    // 渲染超时时间
    let pdfFileName = stringRandom(20, { numbers: false }) + '.pdf';
    let date = moment(Date.now()).format('YYYY-MM-DD');
    let pdfDailyPath = helper.getPdfPath(date);
    if(!require('fs').existsSync(pdfDailyPath)){
        require('fs').mkdirSync(pdfDailyPath,{recursive:true})
    }
    
    let pdfFullName = pdfDailyPath + '/' + pdfFileName;
    
    browserHelper.loadPage({
        pageUrl : postParam.pageUrl,
        timeout : ~~postParam.timeout,
        delay :  ~~postParam.delay,
        checkPageCompleteJs : postParam.checkPageCompleteJs,
    },async function(page) {
        await browserHelper.renderPdf(page,pdfFullName);
        if(require('fs').existsSync(pdfFullName)){
            res.send(helper.successMsg({file : 'pdf/' + date + '/' + pdfFileName}))
        }else{
            res.send(helper.failMsg("render fail"))
        }
    }).catch(function(e){
        let errorMsg = e.toString();
        if(/ERR_CONNECTION_REFUSED/.test(errorMsg)){
            errorMsg = "PDF生成服务器无法访问到页面的URL"
        }
        res.send(helper.failMsg("fail:" + errorMsg));
    });
};

const renderBook = function(req, res, next){
    req.body.checkPageCompleteJs = "window.status === 'PDFComplete'";
    req.body.timeout = req.body.timeout || 15000;
    return renderPdf(req,res,next);
};

const renderImage = function(req, res, next){
    let postParam = req.body;
    let element = (postParam.element || 'body') + '';
    browserHelper.loadPage({
        pageUrl : postParam.pageUrl,
        timeout : ~~postParam.timeout,
        delay : ~~postParam.delay,
        width : ~~postParam.width,
        height : ~~postParam.height,
        checkPageCompleteJs : postParam.checkPageCompleteJs,
    },async function(page) {
        let imageData =  await browserHelper.screenshotDOMElement(page,element);
        if(imageData){
            res.send(helper.successMsg({image : 'data:image/png;base64,' + imageData}))
        }else{
            res.send(helper.failMsg("render fail"));
        }
    }).catch(function(e){
        console.error(e.toString());
        res.send(helper.failMsg("fail:" + e.toString()));
    });
};

const renderImages = function(req, res, next){
    let postParam = req.body;
    let elements = postParam.elements || [];
    browserHelper.loadPage({
        pageUrl : postParam.pageUrl,
        timeout : ~~postParam.timeout,
        delay : ~~postParam.delay,
        width : ~~postParam.width,
        height : ~~postParam.height,
        checkPageCompleteJs : postParam.checkPageCompleteJs,
    },async function(page) {
        let images =  await browserHelper.screenshotDOMElements(page,elements);
        if(images){
            res.send(helper.successMsg({images : images}))
        }else{
            res.send(helper.failMsg("render fail"));
        }
    }).catch(function(e){
        console.error(e.toString());
        res.send(helper.failMsg("fail:" + e.toString()));
    });
};

const downloadPdf = function(req, res, next) {
    let fileName = req.query.fileName || 'output.pdf';
    let file = req.params[0].replace(/\.\./g,"");
    if(/[^\w \-\/]/.test(file)){
        res.sendStatus(400).send('Not Found');
        return;
    }
    let pdfPath = helper.getPdfPath();
    if(require('fs').exists(helper.getPdfPath(file),function (isExist) {
        if(isExist){
            fileName = fileName.replace(/[\r\n<>\\\/\|\:\'\"\*\?]/g,"")
            let headers = {
                "Content-type":"application/octet-stream",
                "Content-Transfer-Encoding":"binary",
            };
            let userAgent = req.headers['user-agent'];
            if((/Safari/i).test(userAgent) && !(/Chrome/i).test(userAgent)){
                headers['Content-Disposition'] = 'attachment; filename*=UTF-8\'\'' + urlencode(fileName,'UTF-8');
            }else{
                headers['Content-Disposition'] = 'attachment;filename="' + urlencode(fileName,'UTF-8') + '"';
            }
            
            try{
                res.sendFile(file,{
                    headers : headers,
                    root : pdfPath
                })
            }catch (e) {
                res.sendStatus(500).send('Server Error');
            }
        }else{
            res.sendStatus(404).send('Not Found');
        }
    }));
};

module.exports = {
    renderPdf,
    renderImage,
    renderImages,
    renderBook,
    downloadPdf,
};
