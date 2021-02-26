let helper = require('../helper/index');
let html2pdf = require('../puppeteer/index');

let renderPdf = function(req, res, next) {
    let pageUrl = req.body.pageUrl;
    // 渲染超时时间
    let timeout = parseInt(req.body.timeout);

    // 检查PDF实付完成的JS表达式，定时检测直到表达式值为true,是看上渲染
    let checkJs = req.body.checkJs;
    let printDelay = parseInt(req.body.printDelay);

    let pdfFile = '/pdf/' + (new Date()).getTime() + '.pdf';
    let pdfFullName = __dirname + '/../../public' + pdfFile;

    html2pdf(pageUrl,pdfFullName,timeout,printDelay,checkJs).then(function () {
        res.send(helper.successMsg({file : pdfFile}))
    },function (errorMsg) {
        res.send(helper.failMsg(errorMsg))
    });
};

let renderImage = function(req, res, next){

    var postParam = req.body;
    var element = postParam.element || 'body';
    var res = {code : 0,msg : 'success',data : null};
    var timeout = ~~postParam.timeout;
    var option = {
        pageUrl : postParam.pageUrl,
        timeout : timeout || 9000,
        debug : true,
        onSuccess : function(page){
            res.data = {
                image_data : helper.captureElementToBase64(page,element)
            };
        },
        onError : function(page,errorMsg,errorCode){
            res.code = errorCode;
            res.msg = errorMsg;
        },
        onEnd : function (page) {
            response.send(res);
        }
    };

    if(postParam.width){
        option.width = ~~postParam.width;
    }

    if(postParam.height){
        option.height = ~~postParam.height;
    }

    helper.loadPage(option);
};

module.exports = {
    renderPdf : renderPdf,
    renderImage : renderImage,
};
