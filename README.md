# 网页截图 和 生成PDF Api服务 

## 使用docker方式
- docker仓库为：wuxue107/screenshot-api-server
- 容器内目录web根目录 /screenshot-api-server/public 为可挂载目录，里面可以放一些静态文件
- 使用运行下面命令，会将当前目录作为，web根目录运行web服务，

```bash
docker pull wuxue107/screenshot-api-server:1.2.0
docker run -p 3000:3000 -td --rm -v ${PWD}:/screenshot-api-server/public --name=screenshot-api-server wuxue107/screenshot-api-server:1.2.0
```
## 本地使用
```bash
yarn && yarn start
```

# API 接口
## 截图

### 单张图片截取
- API: http://localhost:3000/api/img
- 请求参数：PSOT JSON
```javascript
{
    // 要截图的网页
    "pageUrl":"https://gitee.com/wuxue107",
    // 要截取的节点选择器,可选，默认body
    "element":"body",
    // 超时时间，可选，默认：3000
    "timeout": 5000,
    // 检查页面是否渲染完成的js表达式，可选，默认: "true"
    "checkPageCompleteJs": "document.readyState === 'complete'",
    // 页面完成后（checkPageCompleteJs返回为true后）延迟的时间，可选，默认：0
    "delay": 100
}
```
- 响应
```javascript
{
  "code": 0,
  "msg": "success",
  "data": {
    "image": "data:image/png;base64,..."
  }
}
```

### 多张图片截取
- 请求参数：PSOT JSON
- API: http://localhost:3000/api/imgs
```javascript
{
    // 要截图的网页
    "pageUrl": "https://gitee.com/wuxue107",
    // 要截取的节点选择器,可选，默认body
    "elements": [".card"],
    // 超时时间，可选，默认：3000
    "timeout": 10000,
    // 检查页面是否渲染完成的js表达式，可选，默认: "true"
    "checkPageCompleteJs": "document.readyState === 'complete'",
    // 页面完成后（checkPageCompleteJs返回为true后）延迟的时间，可选，默认：0
    "delay": 100
}
```
- 响应
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "images": {
       ".nop-page": [
            "data:image/png;base64,...",
       ]
    } 
  }
}
```

## 生成PDF 
- API: http://localhost:3000/api/pdf
- 请求参数：PSOT JSON，请设置一个较长的超时时间
```javascript
{
    // 要截图的网页
    "pageUrl": "https://bookjs.zhouwuxue.com/eazy-2.html",
    // 超时时间，可选，默认：3000
    "timeout": 20000,
    // 检查页面是否渲染完成的js表达式，可选，默认: "true"
    "checkPageCompleteJs": "window.status === 'PDFComplete'",
    // 页面完成后（checkPageCompleteJs返回为true后）延迟的时间，可选，默认：0
    "delay": 100
}
```
- 响应，生成的pdf文件存放在web可挂载的web目录下,路径/pdf/xxxx.pdf
```javascript
{
  "code": 0,
  "msg": "success",
  "data": {
    // 拼接上接口的前缀 http://localhost:3000/ 就是完整地址 http://localhost:3000/pdf/1614458263411-glduu.pdf
    "file": "/pdf/1614458263411-glduu.pdf"
  }
}
```
