let helper = require('../helper/index');
let browserHelper = require('../puppeteer/index');
const stringRandom = require('string-random');
const _ = require('lodash');

let renderPdf = function(req, res, next) {
    let postParam = req.body;
    // 渲染超时时间
    let pdfFile = '/pdf/'  + (new Date()).getTime() + '-' + stringRandom(5, { numbers: false }) + '.pdf';
    let pdfFullName = __dirname + '/../../public' + pdfFile;
    
    browserHelper.loadPage({
        pageUrl : postParam.pageUrl,
        timeout : ~~postParam.timeout,
        delay :  ~~postParam.delay,
        checkPageCompleteJs : postParam.checkPageCompleteJs,
    },async function(page) {
        await browserHelper.renderPdf(page,pdfFullName);
        if(require('fs').existsSync(pdfFullName)){
            res.send(helper.successMsg({file : res.origin + pdfFile}))
        }else{
            res.send(helper.failMsg("render fail"))
        }
    }).catch(function(e){
        res.send(helper.failMsg("fail:" + e.toString()));
    });
};

let renderBook = function(){
    
};

let renderImage = function(req, res, next){
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

let renderImages = function(req, res, next){
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

module.exports = {
    renderPdf,
    renderImage,
    renderImages,
    renderBook,
};
