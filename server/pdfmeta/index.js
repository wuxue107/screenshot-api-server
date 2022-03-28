const nodeExiftool = require( 'node-exiftool')

const setPdfMetaInfo = function(pdfFile,metaInfoUpdate){
    let exiftool = new nodeExiftool.ExiftoolProcess(require('dist-exiftool'));
    let metaInfo = {
        Creator: 'screenshot-api-server',
        Producer: 'bookjs-eazy',
    };
    
    if(typeof metaInfoUpdate.Author === 'string'){
        metaInfo.Author = metaInfoUpdate.Author;
    }
    if(typeof metaInfoUpdate.Subject === 'string'){
        metaInfo.Subject = metaInfoUpdate.Subject;
    }
    if(typeof metaInfoUpdate.Keywords === 'string'){
        metaInfo.Keywords = metaInfoUpdate.Keywords;
    }
    
    return  exiftool.open()
        .then(function () {
            return exiftool.writeMetadata(pdfFile, metaInfo);
        })
        .then(() => exiftool.close())
        .catch(err => {
            console.error(err)
        })
};

module.exports = {
    setPdfMetaInfo : setPdfMetaInfo,
};
