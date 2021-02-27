let helper = require('../helper/index');
let browserHelper = require('../puppeteer/index');

let renderPdf = function(req, res, next) {
    let postParam = req.body;
    // 渲染超时时间
    let pdfFile = '/pdf/' + (new Date()).getTime() + '.pdf';
    let pdfFullName = __dirname + '/../../public' + pdfFile;

    browserHelper.loadPage({
        pageUrl : postParam.pageUrl,
        timeout : ~~postParam.timeout,
        delay :  ~~postParam.delay,
        checkPageCompleteJs : postParam.checkPageCompleteJs,
    },async function(page) {
        await browserHelper.renderPdf(page,pdfFullName);
        if(require('fs').existsSync(pdfFullName)){
            res.send(helper.successMsg({file : pdfFile}))
        }else{
            res.send(helper.failMsg("render fail"))
        }
    },timeout,printDelay,checkJs).catch(function(e){
        res.send(helper.failMsg("fail:" + e.toString()));
    });
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
            res.send(helper.successMsg({imageData : 'data:image/png;base64,' + imageData}))
        }else{
            res.send(helper.failMsg("render fail"));
        }
    }).catch(function(e){
        console.error(e.toString());
        res.send(helper.failMsg("fail:" + e.toString()));
    });
};

module.exports = {
    renderPdf : renderPdf,
    renderImage : renderImage,
};
