const nodeExiftool = require('node-exiftool');
const pdfTool = require('../pdftool');
const Lodash = require('lodash');

const setPdfMetaInfo = function (pdfFile, metaInfoUpdate) {
    let exiftool = new nodeExiftool.ExiftoolProcess(require('dist-exiftool'));
    let metaInfo = {
        Creator: 'screenshot-api-server',
        Producer: 'bookjs-eazy',
    };
    if (typeof metaInfoUpdate.Author === 'string') {
        metaInfo.Author = metaInfoUpdate.Author;
    }
    if (typeof metaInfoUpdate.Subject === 'string') {
        metaInfo.Subject = metaInfoUpdate.Subject;
    }
    if (typeof metaInfoUpdate.Keywords === 'string') {
        metaInfo.Keywords = metaInfoUpdate.Keywords;
    }

    return exiftool.open()
        .then(function () {
            return exiftool.writeMetadata(pdfFile, metaInfo);
        })
        .then(() => exiftool.close())
        .then(() => {
            setTimeout(function () {
                require('fs').unlink(pdfFile + "_original", function () {
                })
            }, 50);
        });
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

const setPdfMetaInfo2 = function (pdfFile, apiBookJsMetaInfo) {
    let option = apiBookJsMetaInfo.information;
    option.pdf = [pdfFile];
    option.output = pdfFile;

    let outline = apiBookJsMetaInfo.outline;
    if(outline && outline.items){
        let bookmarkItemOptions = [];
        buildOutlineOption(bookmarkItemOptions,outline.items,1);
        option.bookmarkItem = bookmarkItemOptions;
    }

    return pdfTool.process(option);
};

module.exports = {
    setPdfMetaInfo: setPdfMetaInfo,
    setPdfMetaInfo2: setPdfMetaInfo2,
};
