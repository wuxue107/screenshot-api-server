let helper = require('../helper/index');
let browserHelper = require('../puppeteer/index');
const stringRandom = require('string-random');
const _ = require('lodash');
const moment = require('moment');
const urlencode = require('urlencode');

const renderPdf = function(req, res, next) {
    req.body.timeout = req.body.timeout || 120000;
    res.setTimeout(req.body.timeout,function(){
        res.send(helper.failMsg("timeout"))
    });
    
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
        html : postParam.html,
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
    req.body.timeout = req.body.timeout || 90000;
    return renderPdf(req,res,next);
};

const renderImage = function(req, res, next){
    let postParam = req.body;
    let element = (postParam.element || 'body') + '';
    browserHelper.loadPage({
        pageUrl : postParam.pageUrl,
        html : postParam.html,
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
        html : postParam.html,
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
    if(/[^\w \-\/\.]/.test(file)){
        res.sendStatus(400);
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
                res.sendStatus(500);
            }
        }else{
            res.sendStatus(404);
        }
    }));
};

const makeBookTplHtml = function (req, res, next) {
    if(!_.isObject(req.body.bookConfig)){
        req.body.bookConfig = {};
    }

    let bookStyleJson = JSON.stringify(req.body.bookStyle  ||  "");

    let bookTpl = req.body.bookTpl || '<div>内容为空</div>';
    let contentBox = '<div>' + bookTpl + '</div>';
    let baseUrl = 'http://127.0.0.1:' + (process.env.PORT || '3000') + '/';
    let bookConfig = _.extend({
        pageSize : 'ISO_A4',
        orientation : 'portrait',// landscape
        padding : "20mm 10mm 20mm 10mm",
        toolBar : false
    },req.body.bookConfig || {});
    bookConfig.start = true;
    bookConfig.contentBox = contentBox;

    let bookConfigStr = JSON.stringify(bookConfig);
    let htmlContent = `<!DOCTYPE html>
<html lang="zh-cmn-Hans">
<head>
    <meta charset="UTF-8">
    <title>screenshot-api-server</title>
    <base href="${baseUrl}" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge, chrome=1">
    <meta name="renderer" content="webkit">
    <meta name="format-detection" content="telephone=no">
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=0">
    <script src="/static/js/polyfill.min.js"></script>
    <script src="/static/js/jquery.min.js"></script>
    <script src="/static/js/lodash.min.js"></script>
    <script src="/static/js/bookjs/latest/bookjs-eazy.min.js"></script>
</head>
<body>
<style id="book-style" type="text/css" rel="stylesheet"></style>
<script>
    document.getElementById('book-style').appendChild(document.createTextNode(${bookStyleJson}));
</script>
<script>
    bookConfig = ${bookConfigStr};
</script>
</body>
</html>
`;
    
    return htmlContent;
};

const renderBookTplHtml = function (req, res, next) {
    req.send(makeBookTplHtml(req,res,next));
};

const renderBookTpl = function(req, res, next){
    req.body.html = makeBookTplHtml(req,res,next);
    renderBook(req,res,next);
};

const renderBookPage = function(req, res, next){
    let tpl_id = req.query.tpl_id;
    let bookConfig = helper.cache.get(tpl_id) || {start : true,contentBox : '<h2>链接已失效</h2>'};
    res.render('tpl-html.art', {
        bookConfig: bookConfig,
    });
};

module.exports = {
    renderPdf,
    renderImage,
    renderImages,
    renderBook,
    downloadPdf,
    renderBookTpl,
    renderBookPage,
    
};
