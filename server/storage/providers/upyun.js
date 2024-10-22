var upyun = require("upyun");
const fs = require("fs");


class MultiPutFileTask{
    constructor(client) {
        this.client = client;
    }

    putFilePart (partId = 0,tryTrys = 0){
        let self = this;
       // console.info("upload uuid:" + self.uuid + ": partId:" + partId + ", start ..." + (tryTrys !== 0? (", Try:" + tryTrys):""));
        return new Promise(function (resolve, reject){
            self.client.multipartUpload(self.remotePath,self.localFile,self.uuid,partId).then(function (){
               // console.info("upload uuid:" + self.uuid + ": partId:" + partId + ", success ...");
                resolve({
                    partId: partId,
                });
            }).catch(function (e){
                console.error(e);
                if(tryTrys < self.partMaxTryTimes){
                    console.warn("upload uuid:" + self.uuid + ": partId:" + partId + ", fail ...");
                    self.putFilePart(partId,tryTrys + 1).then(function (){
                        resolve({
                            partId: partId,
                        });
                    }).catch(function (e){
                        reject(e)
                    })
                }else{
                    console.error("upload uuid:" + self.uuid + ": partId:" + partId + ", fail ...");
                    reject({
                        partId: partId,
                        error: e
                    })
                }
            })
        })
    }

    doNextTask (resolve,reject){
        let self = this;
        let bk = false;
        if(self.currentProcessCount < self.maxProcessCount){
            for (let i = self.currentProcessCount; i < self.maxProcessCount; i++) {
                if(bk){
                    break;
                }
                if(self.currentPartIndex < self.partCount){
                    let currentPart = self.currentPartIndex;
                    self.currentPartIndex++;
                    self.currentProcessCount++
                    self.putFilePart(currentPart,0).then(function (){
                        self.partCountCompleted++;
                        self.currentProcessCount--;
                        if(self.partCountCompleted >= self.partCount){
                            resolve();
                        }else{
                            self.uploadParts(resolve,reject)
                        }
                    }).catch(function (e){
                        bk = true;
                        reject(e);
                    })
                }
            }
        }
    }

    async initTask(remotePath,localFile,maxProcessCount,partMaxTryTimes,options = {}){
        this.uuid = undefined;
        this.partCount = 0;
        this.fileSize = 0;

        this.partCountCompleted = 0;
        this.currentPartIndex = 0;

        this.maxProcessCount = maxProcessCount;
        this.currentProcessCount = 0;
        this.partMaxTryTimes = partMaxTryTimes;

        this.remotePath = remotePath;
        this.localFile = localFile;
        let partInfo = await this.client.initMultipartUpload(this.remotePath,this.localFile,options);
        this.uuid = partInfo.uuid;
        this.partCount = partInfo.partCount;
        this.fileSize = partInfo.fileSize;
    }

    async uploadParts(resolve,reject){
        let self = this;
        if(resolve === undefined){
            return new Promise(function (resolve,reject){
                self.doNextTask(resolve,reject)
            })
        }else{
            self.doNextTask(resolve,reject)
        }
    }

    async completeMultipartUpload(){
        return await this.client.completeMultipartUpload(this.remotePath,this.uuid)
    }

    async multipartUpload(remotePath,localFile,maxProcessCount,partMaxTryTimes,options){
        await this.initTask(remotePath,localFile,maxProcessCount,partMaxTryTimes,options);
        await this.uploadParts()
        return await this.completeMultipartUpload()
    }

    static async createMultipartUpload (client,remotePath,localFile,maxProcessCount = 10,partMaxTryTimes = 1,options = {}){
        let task =  new MultiPutFileTask(client)
        await task.multipartUpload(remotePath,localFile,maxProcessCount,partMaxTryTimes,options);
    }
}

class StorageUpyun{

    
    constructor(config) {
        const service = new upyun.Service(config.bucket, config.appKey,config.appSecret);
        this.client = new upyun.Client(service);
    }
    
    
    async uploadFile(remotePath,localFile){
        return await this.client.putFile(remotePath,fs.createReadStream(localFile))
        //return await MultiPutFileTask.createMultipartUpload(this.client,remotePath,localFile);
    }
}



module.exports = StorageUpyun;
