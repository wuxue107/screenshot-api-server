const _ = require('lodash');

let BrowserPool = async function(userOptions){
    userOptions = userOptions || {};
    let options = _.merge({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 3,
        retryLimit : 0,
        timeout : 60000,
        monitor : true,
        puppeteerOptions : {
            headless: true,
            dumpio : false,
            args: ['--no-sandbox', '--disable-setuid-sandbox','–no-first-run']
        }
    },userOptions);

    return  await Cluster.launch(options);
};


module.exports = BrowserPool;
