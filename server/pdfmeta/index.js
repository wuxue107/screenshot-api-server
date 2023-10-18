const nodeExiftool = require('node-exiftool');
const pdfTool = require('../pdftool');
const Lodash = require('lodash');
const helper = require('../helper/index');

const setPdfMetaInfo = async function (pdfFile, apiBookJsMetaInfo,ignoreMeta) {
    // 是否包含目录
    let hasOutline = apiBookJsMetaInfo.outline && apiBookJsMetaInfo.outline.items && apiBookJsMetaInfo.outline.items.length > 0;
    let information = apiBookJsMetaInfo.information || {};
    if(!hasOutline){
        if((ignoreMeta || Lodash.isEmpty(information))){
            return;
        }
        
        let obj = Lodash.clone(information);
        delete obj.author;
        delete obj.keywords;
        delete obj.subject;
        if(Lodash.isEmpty(obj)){
            await setPdfMetaByExifTool(pdfFile,apiBookJsMetaInfo);
            return;
        }
    }

    await setPdfMetaInfoByJavaPdfTool(pdfFile,apiBookJsMetaInfo);
};

const buildOutlineOption = function(bookmarkItemOptions,subItems,level){
    for(let k in subItems){
        let subItem = subItems[k];
        if(subItem.linkId){
            bookmarkItemOptions.push(level + " " + subItem.linkId + " " + subItem.title);
        }else{
            bookmarkItemOptions.push(level + " " + (~~subItem.pageIndex) + " " + (subItem.top??0) + " " + (subItem.left??0) + (subItem.zoom?(" " + subItem.zoom):"") + " " + subItem.title);
        }

        if(subItem.items){
            buildOutlineOption(bookmarkItemOptions,subItem.items,level+1)
        }
    }
};


const setPdfMetaByExifTool = async function (pdfFile, apiBookJsMetaInfo) {
    helper.info("exif_tool: set pdf meta");
    let exiftool = new nodeExiftool.ExiftoolProcess(require('dist-exiftool'));
    let metaInfo = {
        Creator: 'bookjs-eazy',
        Producer: 'screenshot-api-server',
    };

    let information = apiBookJsMetaInfo.information || {};

    if (typeof information.author === 'string') {
        metaInfo.Author = information.author;
    }
    if (typeof information.subject === 'string') {
        metaInfo.Subject = information.subject;
    }
    if (typeof information.keywords === 'string') {
        metaInfo.Keywords = information.Keywords;
    }

    await exiftool.open();
    await exiftool.writeMetadata(pdfFile, metaInfo);
    await exiftool.close();
    require('fs').unlink(pdfFile + "_original",function(err){
        if(err){
            helper.warn("remove file error:" + pdfFile + "_original")
        }
    })
};

const setPdfMetaInfoByJavaPdfTool = async function (pdfFile, apiBookJsMetaInfo) {
    helper.info("pdf_tool: set pdf meta");
    let option = apiBookJsMetaInfo.information || {};
    option.pdf = [pdfFile];
    option.output = pdfFile;

    let outline = apiBookJsMetaInfo.outline;
    if(outline && outline.items){
        let bookmarkItemOptions = [];
        buildOutlineOption(bookmarkItemOptions,outline.items,1);
        option.bookmarkItem = bookmarkItemOptions;
    }

    await pdfTool.process(option);
};

module.exports = {
    setPdfMetaInfo: setPdfMetaInfo,
};
