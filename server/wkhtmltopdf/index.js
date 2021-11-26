const childProcess = require("child_process");
const execFile = childProcess.execFile;
const helper = require('../helper/index');
const genericPool = require("generic-pool");

const execCommand = async function (commandFile, commandArgs, timeout) {
    let index = await commandPool.acquire();
    let subProcess;
    return new Promise(function (resolve, reject) {
        helper.info("[" + index + "]: run command:");
        helper.info(commandFile);
        helper.info(commandArgs);

        if(!(commandArgs instanceof Array)){
            commandArgs = commandOptionsToArgs(commandArgs)
        }
        
        subProcess = execFile(commandFile, commandArgs, {
            maxBuffer: 4 * 1024 * 1024,
            timeout: timeout
        }, function (err, stdout, stderr) {
            commandPool.release(index);
            helper.log("STDOUT:" + stdout);
            if (stderr) {
                helper.log("ERROR:" + stderr);
            }

            if (err) {
                reject();
            } else {
                resolve();
            }
        });

        helper.info("PID:" + subProcess.pid);
    });
};

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
    return execCommand("wkhtmltopdf", commandArgs, timeout);
};

const wkHtmlToPdfBook = function (url, pdfFile, pageSize, orientation, delay, timeout) {
    return wkHtmlToPdf(url, pdfFile, pageSize, orientation, delay, timeout, "PDFComplete");
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
    if (maxProcess === undefined) {
        if (process.env.MAX_COMMAND) {
            maxProcess = ~~process.env.MAX_BROWSER;
        } else {
            maxProcess = 5;
        }
    }

    if (maxProcess < 2) maxProcess = 2;

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
    wkHtmlToPdfBook: wkHtmlToPdfBook,
};
