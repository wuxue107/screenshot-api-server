// puppeteer 库会下载自带chrome，使用自带chrome启动并渲染
const puppeteer = require('puppeteer');
const _ = require('lodash');
const request = require('request');
const fs = require('fs');
const helper = require('../helper');

const sleep = async function(timeout){
    return new Promise(function(resolve){
        setTimeout(function(){
            resolve();
        },timeout)
    });
};
const waitPageComplete = async function(page,timeout,checkPageCompleteJs){
    timeout = ~~timeout;
    if(timeout < 1000){
        timeout = 1000;
    }
    if(timeout > 60000){
        timeout = 60000;
    }
    checkPageCompleteJs = ((checkPageCompleteJs || '') + '') || 'window.document.readyState === "complete"';

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
                loadComplete = await page.evaluate((checkPageCompleteJs)).catch(function(e){
                    console.error("waitPageComplete error:" + e.toString())
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

const screenshotDOMElement = async function(page, selector, saveFile,encoding,type) {
    type = type === 'jpeg'?'jpeg':'png';
    encoding = encoding === 'binary'?'binary':'base64';
    const rect = await page.evaluate(selector => {
        try{
            const element = document.querySelector(selector);
            const {left, top, width, height} = element.getBoundingClientRect();
            if(width * height !== 0){
                return {left, top, width, height};
            }else{
                return null;
            }
        }catch(e){
            return null;
        }
    }, selector);
    let option = {
        type : type,
        encoding : encoding,
        clip: rect ? {
            y:    rect.top,
            x:   rect.left,
            width:  rect.width,
            height: rect.height
        } : null
    };
    if(saveFile){
        option.path = saveFile;
    }
    
    return await page.screenshot(option);
};

const screenshotDOMElements = async function(page, selectors, savePath,encoding,type) {
    type = type === 'jpeg'?'jpeg':'png';
    encoding = encoding === 'binary'?'binary':'base64';

    if(!_.isArray(selectors)){
        throw "invalid screenshot selectors";
    }
    
    let images = {};
    for(let i in selectors){
        let selector = selectors[i];
        if(!_.isString(selector)){
            continue;
        }
        let rects = await page.evaluate(selector => {
            try{
                let elements = document.querySelectorAll(selector);
                let ranges =[];
                elements.forEach(function(element){
                    let {left, top, width, height} = element.getBoundingClientRect();
                    if(width * height !== 0){
                        return ranges.push({left, top, width, height});
                    }
                });
                
                return ranges;
            }catch(e){
                return [];
            }
        }, selector);

        images[selector] = [];
        for(let j in rects){
            let rect = rects[j];
            let option = {
                type : type,
                encoding : encoding,
                clip: rect ? {
                    y:    rect.top,
                    x:   rect.left,
                    width:  rect.width,
                    height: rect.height
                } : null
            };
            if(savePath){
                //option.path = saveFile;
            }
            
            let imageData = await page.screenshot(option);
            if(imageData){
                images[selector].push('data:image/png;base64,' + imageData)
            }
        }
    }
    
    return images;
};

const renderPdf = async function(page,saveFile){
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

const closeBrowser = function () {
    if(browser){
        try{
            browser.close();
            browser = null;
        }catch (e) {
            console.log("close browser fail:" + e.toString())
        }
    }
};

let getDefaultBrowserInfo = function(path){
    return new Promise( (resolve,reject)=>{
        request.get({
            uri:  "http://127.0.0.1:9222/json/version",
            json: true
        },function(err, httpResponse, body){
            if(err){
                reject(err)
            }else{
                resolve(body)
            }
        })
    })
};

const getBrowser = async function(){
    if(browser) {
        if(browser.isConnected()){
            return browser;
        }
        
        closeBrowser();
    }
    
    browser =  await puppeteer.launch({
        headless: true,
        dumpio: false,
        defaultViewport: {
            width: 1280,
            height: 960
        },
        args: [
            '--headless',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--unlimited-storage',
            '--disable-dev-shm-usage',
            '--full-memory-crash-report',
            '--disable-extensions',
            '--mute-audio',
            '–no-first-run',
            '--start-maximized'
        ]
    });

    return browser;
};

const getPage = async function(doFunc,timeout){
    timeout = timeout || 30000;
    return new Promise(function(resolve,reject){
        (async function(){
            let page,closeCurrentPage;
            let timeoutId = setTimeout(function () {
                if(closeCurrentPage){
                    closeCurrentPage();
                }
                reject("timeout " + timeout + "ms");
            },timeout + 5);
            
            closeCurrentPage = function () {
                clearTimeout(timeoutId);
                if(page){
                    console.info("close page:" + page.url())
                    page.close();
                    page = null;
                }
            };

            try{
                browser = await getBrowser();
                page = await browser.newPage();
                await doFunc(page);
                closeCurrentPage();
            }catch (e) {
                closeCurrentPage();
                reject("error:" + e.toString());
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
    let checkPageCompleteJs = options.checkPageCompleteJs;
    // 打开页面的URL
    let pageUrl = (options.pageUrl || '') + '';

    if(!/^https?:\/\/.*/.test(pageUrl)){
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
        page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36');
        await page.goto(pageUrl);

        console.log("wait page load complete ...");
        await waitPageComplete(page,timeout,checkPageCompleteJs);
        console.log("print delay:" + delay);
        await sleep(delay);
        console.log("do user action");
        await doFunc(page);
    },timeout);
};

const initBrowser = async function(){
    await getBrowser();
    let pdfPath = helper.getPdfPath();
    if(!fs.existsSync(pdfPath)){
        fs.mkdirSync(pdfPath);
    }
};

initBrowser();

module.exports = {
    loadPage,
    renderPdf,
    screenshotDOMElement,
    screenshotDOMElements
};
