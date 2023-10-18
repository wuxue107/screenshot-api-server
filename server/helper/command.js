const childProcess = require("child_process");
const execFile = childProcess.execFile;
const genericPool = require("generic-pool");
const helper = require('./index');

let execCommand = async function (commandFile, commandArgs, timeout) {
    let index = await commandPool.acquire();
    let subProcess;
    await new Promise(function (resolve, reject) {
        helper.info("[" + index + "]: run command:'" + commandFile + "', with args:" + JSON.stringify(commandArgs));

        let errorMsg = '';
        subProcess = execFile(commandFile, commandArgs, {
            maxBuffer: 4 * 1024 * 1024,
            timeout: timeout
        }, function (err, stdout, stderr) {
            helper.log("[" + index + "]:STDOUT:" + stdout);
            if (stderr) {
                helper.log("[" + index + "]:ERROR:" + stderr);
                errorMsg += stderr;
            }
        });
        
        subProcess.on('exit',function (code, signals) {
            helper.info("[" + index + "]: end command,exit code:" + code)
            commandPool.release(index);
            if(code === 0){
                resolve();
            }else{
                reject(errorMsg)
            }
        });
        
        if(!subProcess.pid){
            reject("[" + index + "]:can not run command: " + commandFile)
        }

        helper.info("[" + index + "]:PID:" + subProcess.pid);
    });
};

const createCommandPool = function (opts) {
    let cnt = 0;
    let commandFactory = {
        create: function () {
            cnt++;
            return cnt;
        },
        destroy: function (index) {
            cnt--;
        }
    };

    return genericPool.createPool(commandFactory, opts);
};

const initCommandPool = function (maxProcess) {
    if (maxProcess === undefined) {
        if (process.env.MAX_COMMAND) {
            maxProcess = ~~process.env.MAX_COMMAND;
        } else {
            maxProcess = 5;
        }
    }

    if (maxProcess < 2) maxProcess = 2;

    helper.info("MAX_COMMAND:" + maxProcess);
    return createCommandPool({
        max: maxProcess,
        min: 1, // minimum size of the pool
        idleTimeoutMillis: 60000,
        softIdleTimeoutMillis: 60000,
        evictionRunIntervalMillis: 1000,
        maxWaitingClients: 3 * maxProcess,
    });
};

const commandPool = initCommandPool();

module.exports = {
    execCommand: execCommand,
};
