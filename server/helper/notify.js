let helper = require('./index');
let request = require('request');



const Notify = function (req, res) {
    this.isSend = false;
    this.req = req;
    this.res = res;
    this.notifyUrl = this.req.body.notifyUrl;
    if(this.isAsync()){
        helper.info("set notify url:" + this.notifyUrl);
        this.isSend = true;
        res.send(helper.successMsg());
    }
};

Notify.prototype.isAsync = function(){
    return !! this.notifyUrl;
};

Notify.prototype.send = function (data) {
    if(!this.isSend){
        this.isSend = true;
        if(this.isAsync()){
            helper.info("send notify to:" + this.notifyUrl);
            request({
                url: this.notifyUrl,
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify(data)
            }, function(error, response, body) {
                if(error){
                    helper.error(error)
                }else{
                    helper.info("resonse code:" + response.statusCode);
                    helper.info("resonse msg:" + body);
                }
            });
        }else{
            helper.info("send response:" + JSON.stringify(data));
            this.isSend = true
            this.res.send(data);
        }
    }
};

module.exports = Notify;
