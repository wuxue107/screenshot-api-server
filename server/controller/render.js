let helper = require('../helper/index');
let browserHelper = require('../puppeteer/index');
const stringRandom = require('string-random');
const _ = require('lodash');

const renderPdf = function(req, res, next) {
    let postParam = req.body;
    // 渲染超时时间
    let pdfFile = (new Date()).getTime() + '-' + stringRandom(5, { numbers: false }) + '.pdf';
    let pdfFullName = helper.getPdfPath(pdfFile);
    
    browserHelper.loadPage({
        pageUrl : postParam.pageUrl,
        timeout : ~~postParam.timeout,
        delay :  ~~postParam.delay,
        checkPageCompleteJs : postParam.checkPageCompleteJs,
    },async function(page) {
        await browserHelper.renderPdf(page,pdfFullName);
        if(require('fs').existsSync(pdfFullName)){
            res.send(helper.successMsg({file : 'pdf/' + pdfFile}))
        }else{
            res.send(helper.failMsg("render fail"))
        }
    }).catch(function(e){
        res.send(helper.failMsg("fail:" + e.toString()));
    });
};

const renderBook = function(req, res, next){
    req.body.checkPageCompleteJs = "window.status === 'PDFComplete'";
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
    let file = req.params.file;
    try{
        fileName = fileName.replace(/[\r\n<>\\\/\|\:\'\"\*\?]/g,"")
        let headers = {
            "Content-type":"application/octet-stream",
            "Content-Transfer-Encoding":"binary",
        };
        
        if((/Firefox/i).test(req.userAgent)){
            headers['Content-Disposition'] = 'filename*="utf8\'\'' + fileName + '"';
        } else if((/MSIE|Edge/i).test(req.userAgent)){
            headers['Content-Disposition'] = "attachment;filename=" + encodeURI(fileName).replace('+','%20');
        }else{
            headers['Content-Disposition'] = "attachment;filename=" + encodeURI(fileName)
        }
        
        res.sendFile(file,{
            headers : headers,
            root : helper.getPdfPath(),
        });
    }catch (e) {
        console.log(e)
        res.send(404,"404");
    }
};

module.exports = {
    renderPdf,
    renderImage,
    renderImages,
    renderBook,
    downloadPdf,
};
