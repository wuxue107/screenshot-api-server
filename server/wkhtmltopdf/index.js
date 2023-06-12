const helper = require('../helper/index');
const command = require('../helper/command');


const optionsPageSize = ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "B0", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "C5E", "COMM10E", "DLE", "EXECUTIVE", "FOLIO", "LEDGER", "LEGAL", "LETTER", "TABLOID"];

const commandOptionsToArgs = function(option){
    let commandArgs = [];
    for (let name in option){
        let val = option[name];
        if(val === false || val === undefined || val === null){
            continue;
        }
        
        commandArgs.push(name);
        if(val !== true){
            commandArgs.push(val+'')
        }
    }
    
    return commandArgs;
};
const wkHtmlToPdf = function (url, pdfFile, pageSize, orientation, delay, timeout, checkWindowStatus) {
    helper.info("wkhtmltopdf: start make pdf, url:" + (url.substr(0,4)==='http' ? url : (url.substr(0,50) + '...')));

    orientation = (orientation + "").toLowerCase();
    orientation = orientation === "landscape" ? "Landscape" : "Portrait";
    timeout = ~~(timeout || 30000);
    if (timeout > 60000) {
        timeout = 60000;
    }
    if (timeout < 3000) {
        timeout = 3000;
    }

    delay = ~~(delay || 200);
    if (delay > 60000) {
        delay = 60000;
    }
    if (delay < 10) {
        delay = 10;
    }

    let commandOptions = {
        "--disable-smart-shrinking" : true,
        "--margin-left" : "0",
        "--margin-right" : "0",
        "--margin-top": "0",
        "--margin-bottom": "0",
        "--no-stop-slow-scripts" : true,
        "--enable-external-links" :true,
        "--enable-internal-links" : true,
        "--debug-javascript": true,
        "--print-media-type" :true,
        "--outline" : true,
        "--outline-depth" : "3",
        "--log-level": "info",
        "--orientation" : orientation,
    };
    
    if (typeof pageSize === 'string') {
        pageSize = (pageSize + "").toUpperCase();
        if (!optionsPageSize.includes(pageSize)) {
            helper.error("invalid pageSize:" + pageSize);
            pageSize = "A4";
        }
        commandOptions["--page-size"] = pageSize;
    } else {
        if (!pageSize.pageWidth || !pageSize.pageHeight) {
            throw "无效的页面尺寸信息";
        }
        commandOptions["--page-width"] = pageSize.pageWidth;
        commandOptions["--page-height"] = pageSize.pageHeight;
    }

    if (delay) {
        commandOptions["--javascript-delay"] =delay;
    }
    
    if (checkWindowStatus) {
        commandOptions["--window-status"] = checkWindowStatus;
    }
    
    let commandArgs = commandOptionsToArgs(commandOptions);
    commandArgs.push(url, pdfFile);
    let ret = command.execCommand("wkhtmltopdf", commandArgs, timeout);
    helper.info("wkhtmltopdf: end make pdf");
    return ret;
};

const wkHtmlToPdfBook = function (url, pdfFile, pageSize, orientation, delay, timeout) {
    return wkHtmlToPdf(url, pdfFile, pageSize, orientation, delay, timeout, "PDFComplete");
};



module.exports = {
    wkHtmlToPdf: wkHtmlToPdf,
    wkHtmlToPdfBook: wkHtmlToPdfBook,
};
