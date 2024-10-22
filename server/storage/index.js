const helper = require("../helper");


const TYPE_FILE = 'file';
const TYPE_QINIU = 'qiniu';
const TYPE_ALI = 'ali';
const TYPE_TENCENT = 'tencent';
const TYPE_UPYUN = 'upyun';

let supportProviders = [
];

supportProviders[TYPE_UPYUN] = require('./providers/upyun');
supportProviders[TYPE_ALI] = require('./providers/ali');
supportProviders[TYPE_QINIU] = require('./providers/qiniu');
supportProviders[TYPE_TENCENT] = require('./providers/tencent');
supportProviders[TYPE_FILE] = require('./providers/file');


const storage = function (config){
    let provider = supportProviders[config.type];
    if(supportProviders[config.type] === undefined){
        throw "invalid storage type";
    }

    return new provider(config);
}

const getDefault = function (){
    return storage({
        type: process.env.STORAGE_TYPE || TYPE_FILE,
        bucket: process.env.STORAGE_BUCKET,
        region: process.env.STORAGE_REGION,
        appKey : process.env.APP_KEY,
        appSecret : process.env.APP_SECRET,
    })
}


const uploadFile = async function (remoteFile,localFile,store){
    if (store === undefined){
        store = getDefault();
    }
    helper.info("upload file start:" + localFile);
    await store.uploadFile(remoteFile,localFile,store)
    helper.info("upload file complete:" + localFile);
}

module.exports = {
    storage,
    getDefault,
    uploadFile
}

