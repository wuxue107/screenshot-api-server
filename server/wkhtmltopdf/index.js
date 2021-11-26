const childProcess = require("child_process");
const execFile = childProcess.execFile;
const helper = require('../helper/index');
const genericPool = require("generic-pool");

const execCommand = async function (commandFile, commandArgs, timeout) {
    let index = await commandPool.acquire();
    let subProcess;
    return new Promise(function (resolve, reject) {
        helper.info("run command:");
        helper.info(commandFile);
        helper.info(commandArgs);
        
        subProcess = execFile(commandFile, commandArgs, {
            maxBuffer: 4 * 1024 * 1024,
            timeout: timeout
        }, function (err, stdout, stderr) {
            if (err) {
                helper.error(err);
                commandPool.release(index);
                reject(err);
            } else if (stderr.length() > 0) {
                helper.log(stderr.toString());
                commandPool.release(index);
            } else {
                helper.log(stdout.toString());
                commandPool.release(index);
                resolve(0);
            }
        });
        helper.info("PID:" + subProcess.pid);
    });
};

const optionsPageSize = ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "B0", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "C5E", "COMM10E", "DLE", "EXECUTIVE", "FOLIO", "LEDGER", "LEGAL", "LETTER", "TABLOID", "CUSTOM"];
const wkHtmlToPdf = async function (url, pdfFile, pageSize, orientation,delay, timeout,checkWindowStatus) {
    orientation = (orientation + "").toLowerCase();
    orientation = orientation === "landscape" ? "Landscape" : "Portrait";
    timeout = ~~(timeout || 4000);
    delay = ~~(delay || 100);

    let commandArgs = [
        "--disable-smart-shrinking",
        "--margin-left", "0",
        "--margin-right", "0",
        "--margin-top", "0",
        "--margin-bottom", "0",
        "--no-stop-slow-scripts",
        "--enable-internal-links",
        "--debug-javascript",
        "--print-media-type",
        "--outline", "--outline-depth", "3",
        "--log-level", "info",
        "--orientation", orientation,
    ];

    if(typeof pageSize === 'string'){
        pageSize = (pageSize + "").toUpperCase();
        if (!optionsPageSize.includes(pageSize)) {
            helper.error("invalid pageSize:" + pageSize);
            pageSize = "A4";
        }
        commandArgs.push("--page-size", pageSize);
    }else{
        if(!pageSize.pageWidth || !pageSize.pageHeight){
            throw "无效的页面尺寸信息";
        }
        
        commandArgs.push("--page-width", pageSize.pageWidth);
        commandArgs.push("--page-height", pageSize.pageHeight);
    }

    if(delay){
        commandArgs.push("--javascript-delay", delay)
    }
    if(checkWindowStatus){
        commandArgs.push("--window-status", checkWindowStatus)
    }
    
    commandArgs.push(url, pdfFile);
    let ok = await execCommand("wkhtmltopdf", commandArgs, timeout);

    return ok;
};

const wkHtmlToPdfBook = function(url, pdfFile, pageSize, orientation,delay, timeout){
    return wkHtmlToPdf(url, pdfFile, pageSize, orientation,delay, timeout,"PDFComplete");
};


const createCommandPool = function (opts) {
    let cnt = 0;
    let commandFactory = {
        create: function () {
            cnt++;
            return cnt;
        },
        destroy: function (index) {
            cnt--;
        }
    };

    return genericPool.createPool(commandFactory, opts);
};

/**
 * 初始化浏览器
 */
const initCommandPool = function (maxProcess) {
    if(maxProcess === undefined){
        if(process.env.MAX_COMMAND){
            maxProcess = ~~ process.env.MAX_BROWSER;
        }else{
            maxProcess = 5;
        }
    }

    if(maxProcess < 2) maxProcess = 2;
    
    helper.info("MAX_COMMAND:" + maxProcess);
    return createCommandPool({
        max: maxProcess,
        min: 1, // minimum size of the pool
        idleTimeoutMillis: 60000,
        softIdleTimeoutMillis: 60000,
        evictionRunIntervalMillis: 1000,
        maxWaitingClients: 3 * maxProcess,
    });
};
const commandPool = initCommandPool();


module.exports = {
    execCommand: execCommand,
    wkHtmlToPdf: wkHtmlToPdf,
    wkHtmlToPdfBook : wkHtmlToPdfBook,
};
