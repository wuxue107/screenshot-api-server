const helper = require('../helper/index');
const command = require('../helper/command');

let commandOptionsToArgs = function (option) {
    let commandArgs = [];
    for (let name in option){
        let val = option[name];
        if(val === undefined || val === null){
            continue;
        }

        if(val instanceof Array){
            for(let i = 0;i<val.length;i++){
                commandArgs.push('--' + name);
                commandArgs.push(val[i])
            }
        }else{
            commandArgs.push('--' + name);
            commandArgs.push(val+'')
        }
    }

    return commandArgs;
};

let PdfTool = {
    process : function (option,timeout) {
        timeout = ~~(timeout || 30000);
        if(timeout < 3000){
            timeout = 3000;
        }
        let commandArgs = commandOptionsToArgs(option);
        commandArgs.unshift('-jar', helper.getRootPath('bin/pdf-tool.jar'));
        return command.execCommand('java',commandArgs,timeout)
    }
};

module.exports = PdfTool;
