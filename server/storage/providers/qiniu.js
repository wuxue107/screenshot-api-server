
const qiniu = require('qiniu');

class StorageQiniu {
    constructor(config) {
        const conf = new qiniu.conf.Config();
        conf.regionsProvider = qiniu.httpc.Region.fromRegionId(config.region);
        conf.useHttpsDomain = false;

        this.mac = new qiniu.auth.digest.Mac(config.appKey, config.appSecret);
        
        this.config = conf;
        this.bucket = config.bucket;
    }

    async uploadFile(remotePath,localFile){
        const formUploader = new qiniu.form_up.FormUploader(this.config);
        const putExtra = new qiniu.form_up.PutExtra();
        const putPolicy = new qiniu.rs.PutPolicy({
            scope: this.bucket
        });
        const uploadToken=putPolicy.uploadToken(this.mac);

        return await formUploader.putFile(uploadToken, remotePath, localFile, putExtra);
    }
}

module.exports = StorageQiniu;
