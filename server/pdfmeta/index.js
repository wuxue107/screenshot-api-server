const nodeExiftool = require('node-exiftool');
const pdfTool = require('../pdftool');
const Lodash = require('lodash');

const setPdfMetaInfo = function (pdfFile, metaInfoUpdate, outlineTree) {
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

const setPdfMetaInfo2 = function (pdfFile, metaInfoUpdate, apiBookJsMetaInfo) {
    let option = apiBookJsMetaInfo.option;
    option.pdf = [pdfFile];
    option.output = pdfFile;
    return pdfTool.process(option);
};

module.exports = {
    setPdfMetaInfo: setPdfMetaInfo,
    setPdfMetaInfo2: setPdfMetaInfo2,
};
