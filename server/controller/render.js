let helper = require('../helper/index');
let browserHelper = require('../puppeteer/index');
let wkHtmlToPdfHelper = require('../wkhtmltopdf/index');
const _ = require('lodash');
const pdfMeta = require('../pdfmeta');
const fs =require('fs');
const urlencode = require('urlencode');

// 定时删除PDF文件任务
require('../cron/pdfclean');

const processPdfMeta = function (req,res,pdfPathInfo) {
    helper.info("process pdf meta:" + pdfPathInfo.relatePath);
    return fs.access(pdfPathInfo.fullPath, fs.constants.R_OK, function (err) {
        if (err) {
            res.send(helper.failMsg("make pdf file failed:" + err));
            return;
        }

        let metaInfo = typeof req.body.metaInfo == 'object' ? req.body.metaInfo : {};

        pdfMeta.setPdfMetaInfo(pdfPathInfo.fullPath, metaInfo).then(()=>{
            helper.info("process pdf meta complete:" + pdfPathInfo.relatePath);
            res.send(helper.successMsg({file: pdfPathInfo.relatePath}));
        }).catch(function (err) {
            helper.error("send pdf metainfo failed:" + pdfPathInfo.relatePath + "," + err);
            res.send(helper.failMsg("send pdf metainfo failed:" + pdfPathInfo.relatePath + "," + err));
        });
    });
};

const renderPdf = function (req, res, next) {
    req.body.timeout = req.body.timeout || 120000;
    res.setTimeout(req.body.timeout, function () {
        res.send(helper.failMsg("timeout"))
    });

    let postParam = req.body;

    let pdfPathInfo = helper.makePdfFileInfo();
    browserHelper.loadPage({
        pageUrl: postParam.pageUrl,
        html: postParam.html,
        timeout: ~~postParam.timeout,
        delay: ~~postParam.delay,
        checkPageCompleteJs: postParam.checkPageCompleteJs,
    },  async function (page) {
        await browserHelper.renderPdf(page, pdfPathInfo.fullPath);
        processPdfMeta(req,res,pdfPathInfo);
    }).catch(function (e) {
        let errorMsg = e.toString();
        if (/ERR_CONNECTION_REFUSED/.test(errorMsg)) {
            errorMsg = "PDF生成服务器无法访问到页面的URL"
        }
        res.send(helper.failMsg("fail:" + errorMsg));
    });
};

const renderBook = function (req, res, next) {
    req.body.checkPageCompleteJs = "window.status === 'PDFComplete'";
    req.body.timeout = req.body.timeout || 90000;
    return renderPdf(req, res, next);
};

/**
 * 从网页中截取一张图片
 *
 * @param req
 * @param res
 * @param next
 */
const renderImage = function (req, res, next) {
    let postParam = req.body;
    let element = (postParam.element || 'body') + '';
    browserHelper.loadPage({
        pageUrl: postParam.pageUrl,
        html: postParam.html,
        timeout: ~~postParam.timeout,
        delay: ~~postParam.delay,
        width: ~~postParam.width,
        height: ~~postParam.height,
        checkPageCompleteJs: postParam.checkPageCompleteJs,
    }, async function (page) {
        let imageData = await browserHelper.screenshotDOMElement(page, element);
        if (imageData) {
            res.send(helper.successMsg({image: 'data:image/png;base64,' + imageData}))
        } else {
            res.send(helper.failMsg("render fail"));
        }
    }).catch(function (e) {
        console.error(e.toString());
        res.send(helper.failMsg("fail:" + e.toString()));
    });
};

/**
 * 从网页中截取多张图片
 * 
 * @param req
 * @param res
 * @param next
 */
const renderImages = function (req, res, next) {
    let postParam = req.body;
    let elements = postParam.elements || [];
    browserHelper.loadPage({
        pageUrl: postParam.pageUrl,
        html: postParam.html,
        timeout: ~~postParam.timeout,
        delay: ~~postParam.delay,
        width: ~~postParam.width,
        height: ~~postParam.height,
        checkPageCompleteJs: postParam.checkPageCompleteJs,
    }, async function (page) {
        let images = await browserHelper.screenshotDOMElements(page, elements);
        if (images) {
            res.send(helper.successMsg({images: images}))
        } else {
            res.send(helper.failMsg("render fail"));
        }
    }).catch(function (e) {
        console.error(e.toString());
        res.send(helper.failMsg("fail:" + e.toString()));
    });
};

/**
 * 根据PDF路径，下载PDF
 * @param req
 * @param res
 * @param next
 */
const downloadPdf = function (req, res, next) {
    let fileName = req.query.fileName || 'output.pdf';
    let file = req.params[0].replace(/\.\./g, "");
    if (/[^\w \-\/\.]/.test(file)) {
        res.sendStatus(400);
        return;
    }
    let fullPath = helper.getPublicPath(file);
    fs.access(fullPath, fs.constants.R_OK,function (err) {
        if (err) {
            res.sendStatus(404);
            return;
        }

        fileName = fileName.replace(/[\r\n<>\\\/\|\:\'\"\*\?]/g, "");
        let headers = {
            "Content-type": "application/octet-stream",
            "Content-Transfer-Encoding": "binary",
        };
        let userAgent = req.headers['user-agent'];
        if ((/Safari/i).test(userAgent) && !(/Chrome/i).test(userAgent)) {
            headers['Content-Disposition'] = 'attachment; filename*=UTF-8\'\'' + urlencode(fileName, 'UTF-8');
        } else {
            headers['Content-Disposition'] = 'attachment;filename="' + urlencode(fileName, 'UTF-8') + '"';
        }

        try {
            res.sendFile(file, {
                headers: headers,
                root: helper.getPublicPath(),
            })
        } catch (e) {
            res.sendStatus(500);
        }
    });
};

/**
 * 生成bookjs-eazy页面模板
 * 
 * @param req
 * @param res
 * @param next
 * @returns {string}
 */
const makeBookTplHtml = function (req, res, next) {
    if (!_.isObject(req.body.bookConfig)) {
        req.body.bookConfig = {};
    }

    let bookStyleJson = JSON.stringify(req.body.bookStyle || "");

    let bookTpl = req.body.bookTpl || '<div>内容为空</div>';
    let contentBox = '<div>' + bookTpl + '</div>';
    let baseUrl = 'http://127.0.0.1:' + (process.env.PORT || '3000') + '/';
    let bookConfig = _.extend({
        pageSize: 'ISO_A4',
        orientation: 'portrait',// landscape
        padding: "20mm 10mm 20mm 10mm",
        toolBar: false
    }, req.body.bookConfig || {});
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
    req.send(makeBookTplHtml(req, res, next));
};

const renderBookTpl = function (req, res, next) {
    req.body.html = makeBookTplHtml(req, res, next);
    renderBook(req, res, next);
};

const renderBookPage = function (req, res, next) {
    let tpl_id = req.query.tpl_id;
    let bookConfig = helper.cache.get(tpl_id) || {start: true, contentBox: '<h2>链接已失效</h2>'};
    res.render('tpl-html.art', {
        bookConfig: bookConfig,
    });
};



/**
 * 使用wkhtmltopdf URL转PDF
 * 
 * @param req
 * @param res
 * @param next
 * 
 * POST JSON
 * {
 *   "pageUrl":"http://localhost:8080/eazy-test.html",
 *   "orientation":"landscape",
 *   "pageSize":"A4" 
 *   // pageWidth : 192, pageHeight:97
 *   // windowStatus : "PDFComplete"
 * }
 */
const renderWkHtmlToPdf = function (req, res, next) {
    let postParam = req.body;

    if(!req.pageSize){
        req.pageSize = {
            pageWidth : ~~req.pageWidth,
            pageHeight : ~~req.pageHeight,
        }
    }
    let pdfPathInfo = helper.makePdfFileInfo();
    wkHtmlToPdfHelper.wkHtmlToPdf(postParam.pageUrl, pdfPathInfo.fullPath, postParam.pageSize, postParam.orientation, postParam.delay, postParam.timeout,postParam.windowStatus).then(function () {
        processPdfMeta(req,res,pdfPathInfo);
    }).catch(function (e) {
        res.send(helper.failMsg("fail:" + e.toString()));
    });
};

/**
 * 转换bookjs-eazy编写的页面转PDF
 * 
 * @param req
 * @param res
 * @param next
 */
const renderWkHtmlToPdfBook = function (req, res, next) {
    req.body.windowStatus = 'PDFComplete';
    renderWkHtmlToPdf(req,res,next);
};

module.exports = {
    renderPdf,
    renderImage,
    renderImages,
    renderBook,
    downloadPdf,
    renderBookTpl,
    renderBookPage,
    renderWkHtmlToPdfBook,
    renderWkHtmlToPdf,

};
