const helper = require('../helper/index');
const command = require('../helper/command');
const Lodash = require('lodash');
const joi = require('joi');

let commandOptionsToArgs = function (option) {
    let commandArgs = [];
    for (let key in option){
        let val = option[key];
        if(val === undefined || val === null){
            continue;
        }
        let name = Lodash.kebabCase(key);
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


let optionSchemaData = {
    'pdf': joi.array().single().items(joi.string().required().max(1024)).min(1).max(255).description('对输出PDF路径列表').error(new Error('invalid pdf length')),
    'output': joi.string().max(1024).required().description('对输出PDF路径列表').error(new Error('invalid output length')),
    'title': joi.string().max(255).default(null).allow(null).optional().description('对输出PDF，设置文档信息：标题').error(new Error('invalid title length')),
    'subject': joi.string().max(255).default(null).allow(null).allow('').optional().description('对输出PDF，设置文档信息：主题').error(new Error('invalid subject length')),
    'author': joi.string().max(255).default(null).allow(null).allow('').optional().description('对输出PDF，设置文档信息：作者').error(new Error('invalid author length')),
    'keywords': joi.string().max(255).default(null).allow(null).allow('').optional().description('对输出PDF，设置文档信息：关键字').error(new Error('invalid keywords length')),
    'bookmarkOpen': joi.boolean().optional().description("对输出PDF，打开书签栏").error(new Error('invalid bookmarkOpen length')),
    'bookmarkExpandLevel': joi.number().min(1).optional().description("对输出PDF，书签栏展开几级菜单").error(new Error('invalid bookmarkExpandLevel length')),
    'bookmarkItem': joi.array().items(joi.string().required()).optional().description("对输出PDF，添加书签，坐标单位pt,坐标原点在左下角，格式为\"[级别] [页号] [X坐标] [Y坐标] [标题]\" 或者 \"[级别] [目标ID] [标题]\"").error(new Error('invalid bookmarkItem length')),

    // 'creator': joi.string().max(64).default('bookjs-eazy').description('对输出PDF，设置文档信息：应用程序').error(new Error('invalid creator')) ,
    // 'producer': joi.string().max(64).default('screenshot-api-server').description('对输出PDF，设置文档信息：PDF制作程序').error(new Error('invalid producer')),

    'readonly': joi.boolean().optional().description('Default: false, 对输出PDF，设置只读').error(new Error('invalid readonly value: boolean')),
    'canAssembleDocument': joi.boolean().optional().description('Default: true, 对输出PDF，设置是否可以插入/删除/旋转页面').error(new Error('invalid canAssembleDocument value: boolean')),
    'canExtractContent': joi.boolean().optional().description('Default: true, 对输出PDF，设置是否可以复制和提取内容').error(new Error('invalid canExtractContent value: boolean')),
    'forAccessibilityDocument': joi.boolean().optional().description('Default: true,对输出PDF，设置是否可以复制和提取内容').error(new Error('invalid forAccessibilityDocument value: boolean')),

    'canFillInForm': joi.boolean().optional().description('Default: true, 对输出PDF，设置是否可以填写交互式表单字段（包括签名字段）').error(new Error('invalid readonly value: boolean')),
    'canModify': joi.boolean().optional().description('Default: true, 对输出PDF，设置是否可以修改文档').error(new Error('invalid canModify value: boolean')),
    'canModifyAnnotations': joi.boolean().optional().description('Default: true, 对输出PDF，设置是否可以添加或修改文本注释并填写交互式表单字段').error(new Error('invalid canModifyAnnotations value: boolean')),
    'canPrint': joi.boolean().optional().description('Default: true, 对输出PDF，设置是否可以打印').error(new Error('invalid canPrint value: boolean')),

    'ownerPassword': joi.string().max(64).default(null).allow(null).allow('').optional().description('对输出PDF，设置编辑密码').error(new Error('invalid ownerPassword')),
    'userPassword': joi.string().max(64).default(null).allow(null).allow('').optional().description('对输出PDF，设置文档信息：查看密码').error(new Error('invalid ownerPassword')),

};
let allowOptionNames = Lodash.keys(optionSchemaData);
let optionSchema = joi.compile(optionSchemaData);

let PdfTool = {
    checkOption : function(option){
        return  optionSchema.validate(Lodash.pick(option,allowOptionNames));
    },
    process : async function (option,timeout) {
        timeout = ~~(timeout || 30000);
        if(timeout < 3000){
            timeout = 3000;
        }

        let res = PdfTool.checkOption(option);
        if(res.error){
            throw res.error;
        }

        option = res.value;
        option.creator = 'screenshot-api-server';
        option.producer = 'bookjs-eazy';

        let commandArgs = commandOptionsToArgs(option);
        commandArgs.unshift('-jar', helper.getRootPath('bin/pdf-tool.jar'));

        await command.execCommand('java',commandArgs,timeout)
    }
};

module.exports = PdfTool;
