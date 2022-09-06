// puppeteer 库会下载自带chrome，使用自带chrome启动并渲染
const puppeteer = require('puppeteer');
const fs = require('fs');
const helper = require('../helper');
const genericPool = require("generic-pool");
const os = require('os');
const { PendingXHR } = require('pending-xhr-puppeteer');

const createPuppeteerPool = function (opts) {
    let puppeteerFactory = {
        create: function() {
            helper.info("start one puppeteer instance");
            return puppeteer.launch({
                headless: true,
                dumpio: false,
                ignoreHTTPSErrors: true,
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
                    '--no-zygote',
                    '--no-first-run',
                    '--start-maximized'
                ]
            });
        },
        destroy: function(browser) {
            helper.info("destroy one puppeteer instance");
            try{
                browser.close();
            }catch (e) {
                helper.error("close browser fail:" + e.toString())
            }
        }
    };

    return genericPool.createPool(puppeteerFactory, opts);
};

const sleep = async function(timeout){
    return new Promise(function(resolve){
        setTimeout(function(){
            resolve();
        },timeout)
    });
};

const waitPageRequestComplete = async function(page){
    helper.info("wait page all request finish");
    const pendingXHR = new PendingXHR(page);
// Here all xhr requests are not finished
    await pendingXHR.waitForAllXhrFinished();
};

/**
 * 页面打开后，通过checkPageCompleteJs代码段在网页里的js环境执行，检查网页是否加载完整
 * 
 * 
 * @param page 页面对象
 * @param timeout 检查时的超时时间，超时则 reject
 * @param checkPageCompleteJs 检查页面是否加载完整的js代码，完整返回true; 如： 'window.document.readyState === "complete"'
 * @returns {Promise}
 */
const waitPageComplete = async function(page,timeout,checkPageCompleteJs){
    if(!checkPageCompleteJs){
        return waitPageRequestComplete(page);
    }
    
    timeout = ~~timeout;
    if(timeout < 1000){
        timeout = 1000;
    }
    if(timeout > 120000){
        timeout = 120000;
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
                    helper.error("waitPageComplete error:" + e.toString())
                });

                if(loadComplete){
                    clearInterval(t);
                    resolve();
                }else{
                    if(time > timeout){
                        setTimeout(function () {
                            clearInterval(t);
                            reject('waitPageComplete timeout');
                        },20);
                    }
                }
            })();
        },tickDelay);
    });
};

/**
 * 从页面的一个html节点，截取一张图片
 * 
 * @param page
 * @param {string} selector html节点的css选择器
 * @param {string} saveFile 保存的文件,传空则直接返回图片内容，默认 undefined
 * @param {string} encoding 返回数据格式化 binary或base64，默认:base64
 * @param {string} type 图片类型,jpeg或png, 默认png
 * 
 * @returns {Promise<string|Buffer|void|*>}
 */
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

/**
 * 从页面的html节点，截取多张图片
 *
 * @param page
 * @param {string[]} selectors 要截取图片的css选择器列表
 * @param {string} encoding 返回数据格式化 binary或base64，默认:base64
 * @param {string} type 图片类型,jpeg或png, 默认png
 *
 * @returns {Promise<Object>}
 */
const screenshotDOMElements = async function(page, selectors,encoding,type) {
    type = type === 'jpeg'?'jpeg':'png';
    encoding = encoding === 'binary'?'binary':'base64';

    if(!Array.isArray(selectors)){
        throw "invalid screenshot selectors";
    }
    
    let images = {};
    for(let i in selectors){
        let selector = selectors[i];
        if(typeof selector !== 'string'){
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
            
            let imageData = await page.screenshot(option);
            if(imageData){
                images[selector].push('data:image/png;base64,' + imageData)
            }
        }
    }
    
    return images;
};

/**
 * 从网页生成PDF文件
 * 
 * @param page
 * @param saveFile 保存pdf文件路径
 * 
 * @returns {Promise<*|Buffer>}
 */
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
        helper.log("save pdf file:" + saveFile);
    }
    
    return await page.pdf(option);
};

/**
 * 获取新页面实例
 * 
 * @param doFunc
 * @param timeout
 * @returns {Promise<Page>}
 */
const getPage = async function(doFunc,timeout){
    timeout = timeout || 30000;
    return new Promise(function(resolve,reject){
        (async function(){
            let browser,page,closeCurrentPage;
            let timeoutId = setTimeout(function () {
                if(closeCurrentPage){
                    closeCurrentPage();
                }
                reject("timeout " + timeout + "ms");
            },timeout + 25);
            
            closeCurrentPage = function () {
                clearTimeout(timeoutId);
                if(page){
                    helper.log("close page:" + page.url());
                    page.close();
                    page = null;
                }
                
                if(browser){
                    browserPool.release(browser);
                    browser = null;
                }
            };
            
            try{
                browser = await browserPool.acquire();
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

/**
 * 打开新页面，并等待加载页面加载完整
 * 
 * @param {Object} options 打开页面选项参数
 *  pageUrl 打开页面的URL
 *  timeout 打开页面超时
 *  width 可视区宽度
 *  height 可视区高度
 *  checkPageCompleteJs 检查页面加载完整,代码段
 *  delay 加载完整后延迟时间
 * @param {function} doFunc(page) 页面加载完整，处理函数
 *
 * @returns {Promise<Page>}
 */
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
    if(pageUrl === ''){
        if(!options.html){
            throw "pageUrl / html param can not both empty"
        }
    }else{
        if(!/^(https?|data):/.test(pageUrl)){
            throw "invalid pageUrl param";
        }
    }

    if(timeout <= 0){
        timeout = 30000;
    }
    if(timeout < 2000) timeout = 2000;
    if(timeout > 120000) timeout = 120000;
    if(delay > timeout - 1000) delay = timeout - 1000;
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
        if(pageUrl === ''){
                pageUrl = await page.evaluate(htmlContent => {
                    return URL.createObjectURL(new Blob([htmlContent], {
                        type: 'text/html'
                    }));
                }, options.html);

                helper.log("html text to blob url:" + pageUrl)
        }else{
            // dataURL 浏览器有URL长度限制
            if(pageUrl.substr(0,5) === 'data:'){
                pageUrl = await page.evaluate(dataUrl => {
                    let arr = dataUrl.split(',');
                    let mime = arr[0].match(/:(.*?);/)[1];
                    let bstr = decodeURIComponent(escape(atob(arr[1])));
                    return URL.createObjectURL(new Blob([bstr], {
                        type: mime
                    }));
                }, pageUrl);

                helper.log("data url to blob url:" + pageUrl)
            }
        }
        
        helper.log("open url:" + pageUrl);
        if(width > 0 && height > 0){
            helper.log("set viewport: width:" + width + ',height:' + height);
            page.setViewport({width:width,height:height});
        }
        page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36');
        
        
        await page.goto(pageUrl);

        helper.log("wait page load complete ...");
        await waitPageComplete(page,timeout,checkPageCompleteJs);
        helper.log("print delay:" + delay);
        await sleep(delay);
        helper.log("do user action");
        await doFunc(page);
    },timeout);
};

/**
 * 初始化浏览器
 */
const initBrowserPool = function(maxProcess){
    let pdfPath = helper.getPublicPath('pdf');
    if(!fs.existsSync(pdfPath)){
        fs.mkdirSync(pdfPath);
    }

    if(maxProcess === undefined){
        if(process.env.MAX_BROWSER){
            if(process.env.MAX_BROWSER === 'auto'){
                let freeMem = os.freemem() / (1024 * 1024);
                helper.info("FREE MEM:" + freeMem + 'm');
                maxProcess = ~~(freeMem / 200);
            }else{
                maxProcess = ~~ process.env.MAX_BROWSER;
            }
        }else{
            maxProcess = 1;
        }
    }
    
    if(maxProcess < 1) maxProcess = 1;
    
    helper.info("MAX_BROWSER:" + maxProcess);
    return createPuppeteerPool({
        max: maxProcess,
        min: 1, // minimum size of the pool
        idleTimeoutMillis : 60000,
        softIdleTimeoutMillis : 60000,
        evictionRunIntervalMillis : 1000,
        maxWaitingClients : 3 * maxProcess,
    });
};

const browserPool = initBrowserPool();

module.exports = {
    loadPage,
    renderPdf,
    screenshotDOMElement,
    screenshotDOMElements
};
