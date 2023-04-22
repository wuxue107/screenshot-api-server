let helper = require('./index');
let request = require('request');



const Notify = function (req, res) {
    this.req = req;
    this.res = res;
    this.notifyUrl = req.body.notifyUrl;
    if(this.notifyUrl){
        console.log("set notify url:" + this.notifyUrl);
        res.send(helper.successMsg());
    }
};

Notify.prototype.isAsync = function(){
    return !!this.notifyUrl;
};

Notify.prototype.send = function (data) {
    if(this.notifyUrl){
        console.log("send notify to:" + this.notifyUrl);
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
                console.error(error)
            }else{
                console.info("resonse code:" + response.statusCode);
                console.info("resonse msg:" + body);
            }
        });
    }else{
        this.res.send(data);
    }
};

module.exports = Notify;