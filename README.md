# 网页截图 和 生成PDF Api服务 

## 截图

### 单张图片截取
- API: http://localhost:3000/api/img
- 请求参数：PSOT JSON
```javascript
{
    // 要截图的网页
    "pageUrl":"https://bookjs.zhouwuxue.com/simple-4.html",
    // 要截取的节点选择器,可选，默认body
    "element":".nop-page",
    // 超时时间，可选，默认：3000
    "timeout":600000,
    // 检查页面是否渲染完成的js表达式，可选: "true"
    "checkPageCompleteJs":"window.status === 'PDFComplete'",
    // 页面完成后（checkPageCompleteJs返回为true后）延迟的时间
    "delay": 0
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
    "pageUrl":"https://bookjs.zhouwuxue.com/simple-4.html",
    // 要截取的节点选择器,可选，默认body
    "elements": [".nop-page"],
    // 超时时间，可选，默认：3000
    "timeout":600000,
    // 检查页面是否渲染完成的js表达式，可选: "true"
    "checkPageCompleteJs":"window.status === 'PDFComplete'",
    // 页面完成后（checkPageCompleteJs返回为true后）延迟的时间
    "delay": 0
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
    "pageUrl":"https://bookjs.zhouwuxue.com/eazy-2.html",
    // 超时时间，可选，默认：3000
    "timeout":600000,
    // 检查页面是否渲染完成的js表达式，可选: "true"
    "checkPageCompleteJs":"window.status === 'PDFComplete'",
    "delay": 0
}
```
- 响应
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
