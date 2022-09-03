
const cron = require('node-cron');
const helper = require('../helper');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

// PDF保存1天 , 0: 不清理PDF文件
let keepDay = ~~(process.env.PDF_KEEP_DAY || 0);
if(keepDay < 0){
    keepDay = 0;
}


const cleanPdf = function () {
    const lastDate = moment(Date.now() - keepDay * 86400 * 1000).format('YYYY-MM-DD');
    const pdfPath = helper.getPublicPath('pdf');
    helper.error('cron scan pdf path:' + pdfPath);
    fs.readdir(pdfPath, (err, files) => {
        if (err) {
            return helper.error('read pdf path files failed')
        }
        files.forEach((filename, index) => {

            if(! /^\d{4}-\d{2}-\d{2}$/.test(filename) || filename > lastDate){
                return;
            }
            console.error(index + ':clear pdf daily path:' + filename);
            
            let pdfDailyPath = path.join(pdfPath, filename);
            fs.stat(pdfDailyPath,(err, stats) => {
                if (err) {
                    console.error('can not remove path:' + pdfDailyPath)
                    return
                }
                
                if (stats.isDirectory()) {
                    fs.rmdir(pdfDailyPath, {recursive:true},(err) => {
                        if(err){
                            console.error('remove pdf daily failed:' + err);
                        }
                    });
                }
            });
        });
    });
};

// '0 0 1 * * *'
const task = cron.schedule('0 0 1 * * *', function () {
    try{
        cleanPdf()
    }catch (e) {
        helper.error("cron failed:" + e);
    }
}, {
    scheduled: false
});

if(keepDay > 0){
    helper.info("register cron: clean pdf,keep day "+ keepDay);
    task.start();
}

module.exports = task;
