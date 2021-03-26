# 网页截图 和 生成PDF Api服务 
    使用node express和puppeteer搭建的WEB截图服务
## 使用docker方式
- docker仓库为：wuxue107/screenshot-api-server
- 容器内目录web根目录 /screenshot-api-server/public 为可挂载目录，里面可以放一些静态文件
- 使用运行下面命令，会将当前目录作为，web根目录运行web服务，

```bash
docker pull wuxue107/screenshot-api-server
docker run -p 3000:3000 -td --rm -v ${PWD}:/screenshot-api-server/public --name=screenshot-api-server wuxue107/screenshot-api-server
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
    // 超时时间，可选，默认：30000
    "timeout": 30000,
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
    // 超时时间，可选，默认：30000
    "timeout": 30000,
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
       ".card": [
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
    "pageUrl": "https://gitee.com/wuxue107",
    // 超时时间，可选，默认：30000
    "timeout": 30000,
    // 检查页面是否渲染完成的js表达式，可选，默认: "true"
    "checkPageCompleteJs": "true",
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
    // 拼接上接口的前缀 http://localhost:3000/ 就是完整PDF地址 
    // http://localhost:3000/pdf/1614458263411-glduu.pdf
    // 拼接上接口的前缀 http://localhost:3000/download/可以就可生成在浏览器上的下载链接
    // http://localhost:3000/download/pdf/1614458263411-glduu.pdf
    // 拼接上http://localhost:3000/static/js/pdfjs/web/viewer.html?file=/pdf/1614458263411-glduu.pdf
    // 可使用pdfjs库进行预览
    "file": "/pdf/1614458263411-glduu.pdf"
  }
}
```

## 生成由 <a href="https://gitee.com/wuxue107/bookjs-eazy" target="_blank">wuxue107/bookjs-eazy</a> 制作的PDF页面

- API: http://localhost:3000/api/book
- 请求参数：PSOT JSON，请设置一个较长的超时时间

```javascript
{
    // 要截图的网页
    "pageUrl": "https://bookjs.zhouwuxue.com/eazy-2.html",
    // 超时时间，可选，默认：30000
    "timeout": 30000,
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
    // 拼接上接口的前缀 http://localhost:3000/ 就是完整PDF地址 
    // http://localhost:3000/pdf/1614458263411-glduu.pdf
    // 拼接上接口的前缀 http://localhost:3000/download/可以就可生成在浏览器上的下载链接
    // http://localhost:3000/download/pdf/1614458263411-glduu.pdf
    // 拼接上http://localhost:3000/static/js/pdfjs/web/viewer.html?file=/pdf/1614458263411-glduu.pdf
    // 可使用pdfjs库进行预览
    "file": "/pdf/1614458263411-glduu.pdf"
  }
}
```

# 内置静态资源

- http://localhost:3000/static/ 下内置了bookjs-eazy的一些依赖静态资源

```
static/js
    - bookjs/
        latest/
            bookjs-eazy.min.js
    - pdfjs/
        web/viewer.html?file=/pdf/2021-03-24/xxxx.pdf 
    - jquery.min.js
    - lodash.min.js
    - polyfill.min.js

```

# 字体安装使用
- 为了加快截图或生成PDF速度,通常字体文件较大，下载耗时。防止渲染截图或PDF出现字体不一致情况，建议预先安装常用字体
- 如果是自己设计的页面，建议css设置字体时，优先使用字体原字体名，再使用网络字体别名，例如：

```html
<style>
    @font-face {
        font-family: YH;
        src: url(./fonts/msyh.ttf);
        font-weight: 400;
        font-style: normal
    }

    body {
        font-family: "Microsoft YaHei", YH, sans-serif;
        font-weight: normal;
    }
</style>
```

- 放入web根目录./fonts下的所有字体文件，会在docker启动时自动加载。
