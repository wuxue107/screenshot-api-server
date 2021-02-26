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
let waitPdfRenderComplete = async function(page,timeout,checkPdfRenderCompleteJs){
    let time = 0;

    return new Promise(function(resolve, reject){
        let t = setInterval( function(){
            time += 200;
            page.evaluate((checkPdfRenderCompleteJs || 'window.document.readyState === "complete"')).then(function(isOk){
                if(isOk){
                    clearInterval(t);
                    resolve();
                }
            });

            if(time > timeout){
                setTimeout(function () {
                    clearInterval(t);
                    reject('timeout');
                },20);
            }
        },200)
    });
};

let screenshotDOMElement = async function(page, selector, path, padding = 0) {
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

    return await page.screenshot({
        path: path,
        clip: rect ? {
            x: rect.left - padding,
            y: rect.top - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2
        } : null
    });
};

const html2pdf = async function(pageUrl,pdfFile,timeout,printDelay,checkPdfRenderCompleteJs){
    return new Promise(function(resolve,reject){
        (async function(){
            let browser;
            let page;
            let closeBrowser = function () {
                if(browser){
                    browser.close();
                    browser = null;
                }
            };

            setTimeout(function () {
                closeBrowser();
                reject("timeout " + timeout + "ms");
            },timeout + 5);

            try{
                browser = await puppeteer.launch({
                    headless: true,
                    dumpio : true,
                    timeout : timeout + 5,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
                page = await browser.newPage();
                page.screenshot()
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

                option.path = pdfFile;

                console.log("open url:" + pageUrl);
                await page.goto(pageUrl);
                console.log("wait pdf render ...");
                await waitPdfRenderComplete(page,timeout,checkPdfRenderCompleteJs);
                console.log("print delay:" + printDelay);
                await sleep(printDelay);
                console.log("save pdf file:" + pdfFile);
                await page.pdf(option);
                closeBrowser();

                if(require('fs').existsSync(pdfFile)){
                    resolve();
                }else{
                    reject("make pdf file fail");
                }

                closeBrowser();
            }catch (e) {
                reject("error:" + e.toString());
                closeBrowser();
            }
        })()
    });
};

module.exports = html2pdf;
