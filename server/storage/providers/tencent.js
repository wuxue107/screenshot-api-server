
class StorageTencent{
    constructor(config) {
        this.config = config;
        var COS = require('cos-nodejs-sdk-v5');
        this.client = new COS({
            SecretId: config.appKey,
            SecretKey: config.appSecret,
        });
    }

    async uploadFile(remotePath,localFile){
        let self = this;
        return await new Promise(function (resolve, reject){
            self.client.uploadFile(
                {
                    Bucket: self.config.bucket,
                    Region: self.config.region,
                    Key: remotePath,
                    FilePath: localFile, // 本地文件地址，需自行替换
                    SliceSize: 1024 * 1024 * 5, // 触发分块上传的阈值，超过5MB使用分块上传，非必须
                },
                function (err, data) {
                    if (err){
                        reject(err);
                    }else{
                        resolve(data)
                    }
                }
            );
        })

    }
}



module.exports = StorageTencent;
