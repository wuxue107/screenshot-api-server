const path = require("path");

class StorageAli{
    
    constructor(config) {
        this.config = config;

        const OSS = require('ali-oss');
        this.client = new OSS({
            bucket: config.bucket,
            region: config.region,
            accessKeyId: config.appKey,
            accessKeySecret: config.appSecret,
        });
    }

    async uploadFile(remotePath,localFile){
        return await this.client.put(remotePath,localFile, { timeout: 60000 * 5 });
    }
}

module.exports = StorageAli;
