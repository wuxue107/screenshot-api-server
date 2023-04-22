let helper = require('./index');
let request = require('request');



const Notify = function (req, res) {
    this.req = req;
    this.res = res;
    this.notifyUrl = req.body.notifyUrl;
    if(this.notifyUrl){
        res.send(helper.successMsg());
    }
};

Notify.prototype.isAsync = function(){
    return !!this.notifyUrl;
};

Notify.prototype.send = function (data) {
    if(this.notifyUrl){
        request({
            url: this.notifyUrl,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(data)
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body) // 请求成功的处理逻辑
            }
        });
    }else{
        this.res.send(data);
    }
};

module.exports = Notify;