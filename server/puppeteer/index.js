// puppeteer 库会下载自带chrome，使用自带chrome启动并渲染
const puppeteer = require('puppeteer');
// const fs = require('fs');
let sleep = async function(timeout){
    return new Promise(function(resolve){
        setTimeout(function(){
            resolve();
        },timeout)
    });
};
let waitPageComplete = async function(page,timeout,checkPdfRenderCompleteJs){
    timeout = ~~timeout;
    if(timeout < 1000){
        timeout = 1000;
    }
    if(timeout > 60000){
        timeout = 60000;
    }
    checkPdfRenderCompleteJs = checkPdfRenderCompleteJs || 'window.document.readyState === "complete"';

    let loadComplete = false;
    let tickDelay = 100;
    let time = 0;
    return new Promise(function(resolve, reject){
        let t = setInterval( function(){
            (async function(){
                if(loadComplete){
                    return;
                }
                
                time += tickDelay;
                loadComplete = await page.evaluate((checkPdfRenderCompleteJs)).catch(function(e){
                    console.error("checkPdfRenderCompleteJs error:" + e.toString())
                });

                if(loadComplete){
                    clearInterval(t);
                    resolve();
                }else{
                    if(time > timeout){
                        setTimeout(function () {
                            clearInterval(t);
                            reject('timeout');
                        },20);
                    }
                }
            })();
        },tickDelay);
    });
};

let screenshotDOMElement = async function(page, selector, saveFile,timeout, padding = 0) {
    const rect = await page.evaluate(selector => {
        try{
            const element = document.querySelector(selector);
            const {x, y, width, height} = element.getBoundingClientRect();
            if(width * height !== 0){
                return {left: x, top: y, width, height, id: element.id};
            }else{
                return null;
            }
        }catch(e){
            return null;
        }
    }, selector);
    let option = {
        clip: rect ? {
            x: rect.left - padding,
            y: rect.top - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2
        } : null
    };
    if(saveFile){
        option.path = saveFile;
    }
    
    return await page.screenshot(option);
};

let renderPdf = async function(page,saveFile){
    let option = {
        //landscape : false,
        displayHeaderFooter: false,
        printBackground : true,
        scale : 1,
        // paperWidth : '1mm',
        // paperHeight : '1mm',
        marginTop : 0,
        marginBottom : 0,
        marginLeft : 0,
        marginRight : 0,
        // Paper ranges to print, e.g., '1-5, 8, 11-13'. Defaults to the empty string, which means print all pages.
        pageRanges : '',
        // Whether to silently ignore invalid but successfully parsed page ranges, such as '3-2'. Defaults to false.
        ignoreInvalidPageRanges : false,
        // HTML template for the print header. Should be valid HTML markup with following classes used to inject printing values into them:
        // date: formatted print date
        // title: document title
        // url: document location
        // pageNumber: current page number
        // totalPages: total pages in the document
        // For example, <span class=title></span> would generate span containing the title.
        headerTemplate : '',
        footerTemplate : '',
        // Whether or not to prefer page size as defined by css. Defaults to false, in which case the content will be scaled to fit the paper size.
        preferCSSPageSize: true,
        // Allowed Values: ReturnAsBase64, ReturnAsStream
        transferMode : 'ReturnAsStream',
    };

    if(saveFile){
        option.path = saveFile;
        console.log("save pdf file:" + saveFile);
    }
    
    return await page.pdf(option);
};

let browser;

let closeBrowser = function () {
    if(browser){
        try{
            browser.close();
            browser = null;
        }catch (e) {
            console.log("close browser fail:" + e.toString())
        }
    }
};

const getBrowser = async function(){
    if(browser) {
        if(browser.isConnected()){
            return browser;
        }
        
        closeBrowser();
    }

    browser = await puppeteer.launch({
        headless: true,
        dumpio: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-extensions', '--mute-audio', '–no-first-run']
    });
    
    return browser;
};


const getPage = async function(doFunc,timeout){
    timeout = timeout || 30000;
    return new Promise(function(resolve,reject){
        (async function(){
            let page;
            let closeCurrentPage = function () {
                if(page){
                    page.close();
                    page = null;
                }
            };

            setTimeout(function () {
                closeCurrentPage();
                reject("timeout " + timeout + "ms");
            },timeout + 5);

            try{
                browser = await getBrowser();
                page = await browser.newPage();
                await doFunc(page);
                closeCurrentPage();
            }catch (e) {
                reject("error:" + e.toString());
                closeCurrentPage();
            }
        })()
    });
};

const loadPage = async function(options,doFunc){
    // 页面打开后，关闭超时时间
    let timeout = ~~options.timeout;
    // 页面窗口宽高
    let width = ~~options.width;
    let height = ~~options.height;
    // 页面加载完成后延迟时间
    let delay = ~~options.delay || 0;
    // 检查PDF实付完成的JS表达式，定时检测直到表达式值为true,是看上渲染
    let checkPageCompleteJs = (options.checkPageCompleteJs || 'true') + '';
    // 打开页面的URL
    let pageUrl = (options.pageUrl || '') + '';

    if(/^https?:\/\/.*/.test(pageUrl)){
        throw "invalid pageUrl param";
    }
    if(timeout < 2000) timeout = 2000;
    if(timeout > 60000) timeout = 60000;
    if(delay > timeout) delay = timeout - 1000;
    if(delay < 0) delay = 0;
    
    if(width > 10000) width = 10000;
    if(width < 0) width = 0;
    if(height > 10000) height = 10000;
    if(height < 0) height = 0;

    doFunc = doFunc || options.success;
    if(typeof doFunc !== 'function'){
        throw "invalid success callback param";
    }
    
    return getPage(async function(page){
        console.log("open url:" + pageUrl);
        if(width > 0 && height > 0){
            console.log("set viewport: width:" + width + ',height:' + height);
            page.setViewport({width:width,height:height});
        }
        
        await page.goto(pageUrl);

        console.log("wait page load complete ...");
        await waitPageComplete(page,timeout,checkPageCompleteJs);
        console.log("print delay:" + delay);
        await sleep(delay);
        console.log("do user action");
        await doFunc(page);
    },timeout);
};


module.exports = {
    loadPage,
    renderPdf,
    screenshotDOMElement
};
